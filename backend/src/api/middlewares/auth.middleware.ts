import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { jwtConfig } from '@/config/jwt';
import { UnauthorizedError, ForbiddenError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        roles: string[];
        permisos: string[];
      };
    }
  }
}

const prisma = new PrismaClient();

/**
 * Middleware de autenticación que verifica el JWT token
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Extraer el token del header 'Authorization'
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de acceso requerido. Formato: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    if (!token) {
      throw new UnauthorizedError('Token de acceso requerido');
    }

    // 2. Verificar el Access Token
    let payload: any;
    try {
      payload = jwt.verify(token, jwtConfig.access.secret as string);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token de acceso expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Token de acceso inválido');
      } else {
        throw new UnauthorizedError('Error de verificación del token');
      }
    }

    // 3. Cargar el usuario y sus permisos
    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: payload.sub },
      include: {
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true
                  }
                }
              }
            }
          },
          where: { activo: true }
        }
      }
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Usuario no autorizado o inactivo');
    }

    // 4. Extraer roles y permisos
    const roles = usuario.roles.map(r => r.rol.nombreRol);
    const permisos: string[] = [];
    
    usuario.roles.forEach(usuarioRol => {
      usuarioRol.rol.permisos.forEach(rolPermiso => {
        if (!permisos.includes(rolPermiso.permiso.nombrePermiso)) {
          permisos.push(rolPermiso.permiso.nombrePermiso);
        }
      });
    });

    // 5. Adjuntar datos al objeto request
    req.user = {
      id: usuario.idUsuario,
      email: usuario.email,
      roles: roles,
      permisos: permisos
    };

    logger.debug(`Usuario autenticado: ${usuario.email}`, { 
      userId: usuario.idUsuario, 
      roles: roles,
      permisos: permisos.length 
    });

    next();

  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    
    logger.error('Error en middleware de autenticación:', error);
    return next(new UnauthorizedError('Error interno de autenticación'));
  }
};

/**
 * Middleware para verificar permisos específicos
 * @param requiredPermissions Array de permisos requeridos
 * @returns Middleware function
 */
export const checkPermissions = (requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      const userPermissions = req.user.permisos || [];
      
      // Verificar si el usuario tiene TODOS los permisos requeridos
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(permission => 
          !userPermissions.includes(permission)
        );

        logger.warn(`Acceso denegado - Permisos faltantes: ${missingPermissions.join(', ')}`, { 
          userId: req.user.id,
          requiredPermissions,
          userPermissions
        });

        throw new ForbiddenError(`No tienes permisos suficientes. Permisos requeridos: ${requiredPermissions.join(', ')}`);
      }

      logger.debug(`Permisos verificados exitosamente`, { 
        userId: req.user.id,
        requiredPermissions
      });

      next();

    } catch (error) {
      if (error instanceof ForbiddenError || error instanceof UnauthorizedError) {
        return next(error);
      }
      
      logger.error('Error en middleware de permisos:', error);
      return next(new ForbiddenError('Error interno de verificación de permisos'));
    }
  };
};

/**
 * Middleware para verificar roles específicos
 * @param requiredRoles Array de roles requeridos (OR logic - al menos uno)
 * @returns Middleware function
 */
export const checkRoles = (requiredRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      const userRoles = req.user.roles || [];
      
      // Verificar si el usuario tiene AL MENOS UNO de los roles requeridos
      const hasRequiredRole = requiredRoles.some(role => 
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        logger.warn(`Acceso denegado - Rol insuficiente`, { 
          userId: req.user.id,
          requiredRoles,
          userRoles
        });

        throw new ForbiddenError(`Acceso denegado. Roles requeridos: ${requiredRoles.join(' o ')}`);
      }

      logger.debug(`Roles verificados exitosamente`, { 
        userId: req.user.id,
        requiredRoles,
        userRoles
      });

      next();

    } catch (error) {
      if (error instanceof ForbiddenError || error instanceof UnauthorizedError) {
        return next(error);
      }
      
      logger.error('Error en middleware de roles:', error);
      return next(new ForbiddenError('Error interno de verificación de roles'));
    }
  };
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 * Útil para endpoints que pueden funcionar con o sin autenticación
 */
export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continuar sin autenticación
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // Continuar sin autenticación
    }

    try {
      const payload: any = jwt.verify(token, jwtConfig.access.secret as string);
      
      const usuario = await prisma.usuario.findUnique({
        where: { idUsuario: payload.sub },
        include: {
          roles: {
            include: {
              rol: {
                include: {
                  permisos: {
                    include: {
                      permiso: true
                    }
                  }
                }
              }
            },
            where: { activo: true }
          }
        }
      });

      if (usuario && usuario.activo) {
        const roles = usuario.roles.map(r => r.rol.nombreRol);
        const permisos: string[] = [];
        
        usuario.roles.forEach(usuarioRol => {
          usuarioRol.rol.permisos.forEach(rolPermiso => {
            if (!permisos.includes(rolPermiso.permiso.nombrePermiso)) {
              permisos.push(rolPermiso.permiso.nombrePermiso);
            }
          });
        });

        req.user = {
          id: usuario.idUsuario,
          email: usuario.email,
          roles: roles,
          permisos: permisos
        };
      }
    } catch (error) {
      // Ignorar errores de token en autenticación opcional
      logger.debug('Token inválido en autenticación opcional, continuando sin autenticación');
    }

    next();

  } catch (error) {
    logger.error('Error en middleware de autenticación opcional:', error);
    next(); // Continuar sin autenticación en caso de error
  }
};

import { Request, Response, NextFunction } from 'express';
import { type Role } from '@/config/roles';

/**
 * Middleware de autorización por roles
 * @param allowedRoles - Array de roles permitidos para acceder al endpoint
 * @returns Middleware function
 */
export const roleMiddleware = (allowedRoles: readonly Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar si el usuario está autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido',
          error: 'Unauthorized'
        });
      }

      // Obtener los roles del usuario (compatible con auth middleware existente)
      const userRoles = req.user.roles;
      if (!userRoles || userRoles.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Usuario sin roles asignados',
          error: 'Forbidden'
        });
      }

      // Verificar si el usuario tiene AL MENOS UNO de los roles permitidos (lógica OR)
      const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role as Role));
      
      if (!hasAllowedRole) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado - Permisos insuficientes',
          error: 'Forbidden',
          requiredRoles: allowedRoles,
          userRoles: userRoles
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor en verificación de roles',
        error: 'InternalServerError'
      });
    }
  };
};

/**
 * Middleware para endpoints públicos (sin autenticación requerida)
 * Permite acceso sin token, pero si hay token lo valida
 */
export const publicAccessMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  // Para endpoints públicos, no requiere autenticación
  // Simplemente continúa al siguiente middleware
  next();
};

/**
 * Middleware para endpoints que son públicos pero con autenticación opcional
 * Si el token está presente, lo valida; si no, continúa como público
 * Debe usarse DESPUÉS de optionalAuthenticate del auth middleware
 */
export const publicWithOptionalAuthMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  // Este middleware se basa en que optionalAuthenticate ya se ejecutó
  // Si hay usuario autenticado, req.user estará presente
  // Si no, req.user será undefined pero se permite continuar
  next();
};

/**
 * Middleware que requiere autenticación pero acepta cualquier rol autenticado
 */
export const authenticatedMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación requerida',
      error: 'Unauthorized'
    });
  }
  return next();
};

/**
 * Middleware para endpoints que pueden ser públicos O autenticados
 * Si está autenticado, incluye la info del usuario; si no, continúa como público
 */
export const optionalAuthMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  // Este middleware simplemente continúa - la lógica de autenticación opcional
  // debe ser manejada por el auth middleware antes de este
  next();
};
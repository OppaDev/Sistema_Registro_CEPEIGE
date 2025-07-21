import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginDto, RefreshTokenDto, LoginResponseDto, RefreshResponseDto } from '@/api/dtos/authDto/auth.dto';
import { jwtConfig } from '@/config/jwt';
import { UnauthorizedError, BadRequestError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';
import { toUsuarioResponseDto, type PrismaUsuarioConRoles } from '@/api/services/mappers';

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Autentica un usuario y genera tokens de acceso
   */
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponseDto> {
    try {
      // 1. Buscar usuario por email incluyendo roles
      const usuario = await this.prisma.usuario.findUnique({
        where: { email: loginDto.email },
        include: {
          roles: {
            include: {
              rol: true
            },
            where: { activo: true }
          }
        }
      });

      // 2. Si no existe o no está activo, lanzar error
      if (!usuario || !usuario.activo) {
        logger.warn(`Intento de login fallido: ${loginDto.email}`, { ip: ipAddress });
        throw new UnauthorizedError('Email o contraseña incorrectos');
      }

      // 3. Comparar contraseña
      const passwordMatch = await bcrypt.compare(loginDto.password, usuario.password);
      if (!passwordMatch) {
        logger.warn(`Contraseña incorrecta para usuario: ${loginDto.email}`, { ip: ipAddress });
        throw new UnauthorizedError('Email o contraseña incorrectos');
      }

      // 4. Generar Tokens
      const roles = usuario.roles.map(r => r.rol.nombreRol);
      
      const accessTokenPayload = {
        sub: usuario.idUsuario,
        email: usuario.email,
        roles: roles
      };

      const refreshTokenPayload = {
        sub: usuario.idUsuario
      };

      const accessToken = jwt.sign(accessTokenPayload, jwtConfig.access.secret as string, {
        expiresIn: jwtConfig.access.expiresIn as string
      } as jwt.SignOptions);

      const refreshToken = jwt.sign(refreshTokenPayload, jwtConfig.refresh.secret as string, {
        expiresIn: jwtConfig.refresh.expiresIn as string
      } as jwt.SignOptions);

      // 5. Crear/Actualizar Sesión en BD
      const refreshExpiresIn = this.getExpirationDate(jwtConfig.refresh.expiresIn);
      
      await this.prisma.sesionUsuario.create({
        data: {
          idUsuario: usuario.idUsuario,
          tokenRefresh: refreshToken,
          fechaExpiracion: refreshExpiresIn,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          activo: true
        }
      });

      // 6. Actualizar 'ultimoAcceso' del usuario
      await this.prisma.usuario.update({
        where: { idUsuario: usuario.idUsuario },
        data: { ultimoAcceso: new Date() }
      });

      // 7. Preparar respuesta usando el mapper
      const userResponse = toUsuarioResponseDto(usuario as PrismaUsuarioConRoles);
      userResponse.ultimoAcceso = new Date(); // Actualizar con la fecha actual

      logger.info(`Login exitoso: ${usuario.email}`, { 
        userId: usuario.idUsuario, 
        ip: ipAddress,
        roles: roles 
      });

      return {
        user: userResponse,
        accessToken,
        refreshToken,
        expiresIn: jwtConfig.access.expiresIn
      };

    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error('Error en AuthService.login:', error);
      throw new BadRequestError('Error interno del servidor durante el login');
    }
  }

  /**
   * Renueva el access token usando un refresh token válido
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    try {
      // 1. Verificar el Refresh Token
      let payload: any;
      try {
        payload = jwt.verify(refreshTokenDto.refreshToken, jwtConfig.refresh.secret as string);
      } catch (error) {
        logger.warn('Refresh token inválido o expirado');
        throw new UnauthorizedError('Token de actualización inválido o expirado');
      }

      // 2. Buscar la sesión en la BD
      const sesion = await this.prisma.sesionUsuario.findUnique({
        where: { tokenRefresh: refreshTokenDto.refreshToken },
        include: {
          usuario: {
            include: {
              roles: {
                include: {
                  rol: true
                },
                where: { activo: true }
              }
            }
          }
        }
      });

      if (!sesion || !sesion.activo || sesion.fechaExpiracion < new Date()) {
        logger.warn('Sesión no encontrada, inactiva o expirada', { userId: payload.sub });
        throw new UnauthorizedError('Sesión inválida o expirada');
      }

      // 3. Verificar que el usuario exista y esté activo
      if (!sesion.usuario || !sesion.usuario.activo) {
        logger.warn('Usuario no encontrado o inactivo', { userId: payload.sub });
        throw new UnauthorizedError('Usuario no autorizado');
      }

      // 4. Generar un nuevo Access Token
      const roles = sesion.usuario.roles.map(r => r.rol.nombreRol);
      const accessTokenPayload = {
        sub: sesion.usuario.idUsuario,
        email: sesion.usuario.email,
        roles: roles
      };

      const newAccessToken = jwt.sign(accessTokenPayload, jwtConfig.access.secret as string, {
        expiresIn: jwtConfig.access.expiresIn as string
      } as jwt.SignOptions);

      logger.info(`Token renovado exitosamente`, { userId: sesion.usuario.idUsuario });

      // 5. Devolver el nuevo Access Token
      return {
        accessToken: newAccessToken,
        expiresIn: jwtConfig.access.expiresIn
      };

    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error('Error en AuthService.refreshToken:', error);
      throw new BadRequestError('Error interno del servidor durante la renovación del token');
    }
  }

  /**
   * Cierra la sesión del usuario eliminando el refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // Eliminar la sesión de la BD
      const result = await this.prisma.sesionUsuario.deleteMany({
        where: { tokenRefresh: refreshToken }
      });

      if (result.count > 0) {
        logger.info('Logout exitoso');
      } else {
        logger.warn('Intento de logout con token no encontrado');
      }

    } catch (error) {
      logger.error('Error en AuthService.logout:', error);
      // No lanzamos error aquí porque el logout debe ser "tolerante a fallos"
    }
  }

  /**
   * Cierra todas las sesiones activas de un usuario
   */
  async logoutAll(userId: number): Promise<void> {
    try {
      await this.prisma.sesionUsuario.deleteMany({
        where: { idUsuario: userId }
      });

      logger.info(`Todas las sesiones cerradas para usuario ${userId}`);

    } catch (error) {
      logger.error('Error en AuthService.logoutAll:', error);
      throw new BadRequestError('Error al cerrar todas las sesiones');
    }
  }

  /**
   * Obtiene todas las sesiones activas de un usuario
   */
  async getActiveSessions(userId: number) {
    try {
      const sesiones = await this.prisma.sesionUsuario.findMany({
        where: { 
          idUsuario: userId,
          activo: true,
          fechaExpiracion: {
            gte: new Date()
          }
        },
        select: {
          idSesion: true,
          fechaCreacion: true,
          fechaExpiracion: true,
          ipAddress: true,
          userAgent: true
        },
        orderBy: {
          fechaCreacion: 'desc'
        }
      });

      return sesiones;

    } catch (error) {
      logger.error('Error en AuthService.getActiveSessions:', error);
      throw new BadRequestError('Error al obtener sesiones activas');
    }
  }

  /**
   * Convierte una duración string (ej: "7d", "15m") a fecha de expiración
   */
  private getExpirationDate(duration: string): Date {
    const now = new Date();
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1));

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        // Fallback: 7 días
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}

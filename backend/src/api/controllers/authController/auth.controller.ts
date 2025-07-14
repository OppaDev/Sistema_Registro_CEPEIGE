import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/api/services/authService/auth.service';
import { LoginDto, RefreshTokenDto } from '@/api/dtos/authDto/auth.dto';
import { BadRequestError } from '@/utils/errorTypes';

const authService = new AuthService();

export class AuthController {
  /**
   * Iniciar sesión de usuario
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginDto: LoginDto = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await authService.login(loginDto, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Renovar token de acceso
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshTokenDto: RefreshTokenDto = req.body;

      const result = await authService.refreshToken(refreshTokenDto);

      res.status(200).json({
        success: true,
        message: 'Token renovado exitosamente',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new BadRequestError('Refresh token es requerido para cerrar sesión');
      }

      await authService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Cerrar todas las sesiones del usuario
   */
  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('Usuario no autenticado');
      }

      await authService.logoutAll(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Todas las sesiones cerradas exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('Usuario no autenticado');
      }

      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: {
          id: req.user.id,
          email: req.user.email,
          roles: req.user.roles,
          permisos: req.user.permisos
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener sesiones activas del usuario
   */
  async getActiveSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('Usuario no autenticado');
      }

      const sessions = await authService.getActiveSessions(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Sesiones activas obtenidas exitosamente',
        data: sessions
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar si el token es válido (health check para frontend)
   */
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Si llegamos aquí, el token es válido (gracias al middleware authenticate)
      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          valid: true,
          user: req.user ? {
            id: req.user.id,
            email: req.user.email,
            roles: req.user.roles
          } : null
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

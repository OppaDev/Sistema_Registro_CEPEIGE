import { AuthService } from '@/api/services/authService/auth.service';
import { LoginDto, RefreshTokenDto } from '@/api/dtos/authDto/auth.dto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, BadRequestError } from '@/utils/errorTypes';

// Mock Prisma
jest.mock('@prisma/client');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('@/utils/logger');
jest.mock('@/api/services/mappers', () => ({
  toUsuarioResponseDto: jest.fn()
}));

const mockPrisma = {
  usuario: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  sesionUsuario: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
} as any;

const mockToUsuarioResponseDto = require('@/api/services/mappers').toUsuarioResponseDto;

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    (authService as any).prisma = mockPrisma;
    
    // Setup default mocks
    mockToUsuarioResponseDto.mockImplementation((user: any) => ({
      idUsuario: user.idUsuario,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      activo: user.activo,
      roles: user.roles?.map((r: any) => r.rol.nombreRol) || []
    }));
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };

    // SRV-AUT-001: Autenticar un usuario con credenciales válidas
    it('SRV-AUT-001: debe autenticar un usuario con credenciales válidas', async () => {
      // Arrange
      const mockUser = {
        idUsuario: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        nombres: 'Test',
        apellidos: 'User',
        activo: true,
        roles: [{
          rol: { nombreRol: 'Admin' }
        }]
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.sesionUsuario.create.mockResolvedValue({});
      mockPrisma.usuario.update.mockResolvedValue({});

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(loginDto.email);
      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        include: {
          roles: {
            include: { rol: true },
            where: { activo: true }
          }
        }
      });
    });

    // SRV-AUT-002: Rechazar credenciales inválidas
    it('SRV-AUT-002: debe rechazar credenciales inválidas', async () => {
      // Arrange
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow('Email o contraseña incorrectos');
    });

    // SRV-AUT-003: Rechazar usuario inactivo
    it('SRV-AUT-003: debe rechazar usuario inactivo', async () => {
      // Arrange
      const mockUser = {
        idUsuario: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        activo: false,
        roles: []
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow('Email o contraseña incorrectos');
    });

    // SRV-AUT-004: Rechazar contraseña incorrecta
    it('SRV-AUT-004: debe rechazar contraseña incorrecta', async () => {
      // Arrange
      const mockUser = {
        idUsuario: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        activo: true,
        roles: []
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow('Email o contraseña incorrectos');
    });
  });

  describe('logout', () => {
    // SRV-AUT-005: Cerrar sesión correctamente
    it('SRV-AUT-005: debe cerrar sesión correctamente', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      mockPrisma.sesionUsuario.deleteMany.mockResolvedValue({ count: 1 });

      // Act
      await authService.logout(refreshToken);

      // Assert
      expect(mockPrisma.sesionUsuario.deleteMany).toHaveBeenCalledWith({
        where: { tokenRefresh: refreshToken }
      });
    });

    // SRV-AUT-006: Manejar graciosamente tokens no encontrados
    it('SRV-AUT-006: debe manejar graciosamente tokens no encontrados', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      mockPrisma.sesionUsuario.deleteMany.mockResolvedValue({ count: 0 });

      // Act & Assert
      await expect(authService.logout(refreshToken)).resolves.not.toThrow();
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token'
    };

    // SRV-AUT-007: Renovar el access token con un refresh token válido
    it('SRV-AUT-007: debe renovar el access token con un refresh token válido', async () => {
      // Arrange
      const mockPayload = { sub: 1 };
      const mockSesion = {
        tokenRefresh: 'valid-refresh-token',
        activo: true,
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días en el futuro
        usuario: {
          idUsuario: 1,
          email: 'test@example.com',
          activo: true,
          roles: [{
            rol: { nombreRol: 'Admin' }
          }]
        }
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      mockPrisma.sesionUsuario.findUnique.mockResolvedValue(mockSesion);
      (jwt.sign as jest.Mock).mockReturnValue('new-access-token');

      // Act
      const result = await authService.refreshToken(refreshTokenDto);

      // Assert
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('expiresIn');
      expect(jwt.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken, expect.any(String));
      expect(mockPrisma.sesionUsuario.findUnique).toHaveBeenCalledWith({
        where: { tokenRefresh: refreshTokenDto.refreshToken },
        include: {
          usuario: {
            include: {
              roles: {
                include: { rol: true },
                where: { activo: true }
              }
            }
          }
        }
      });
    });

    it('debe rechazar refresh token inválido', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow(UnauthorizedError);
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow('Token de actualización inválido o expirado');
    });

    it('debe rechazar cuando la sesión no existe', async () => {
      // Arrange
      const mockPayload = { sub: 1 };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      mockPrisma.sesionUsuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow(UnauthorizedError);
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow('Sesión inválida o expirada');
    });

    it('debe rechazar cuando la sesión está inactiva', async () => {
      // Arrange
      const mockPayload = { sub: 1 };
      const mockSesion = {
        tokenRefresh: 'valid-refresh-token',
        activo: false,
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usuario: {
          idUsuario: 1,
          email: 'test@example.com',
          activo: true,
          roles: []
        }
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      mockPrisma.sesionUsuario.findUnique.mockResolvedValue(mockSesion);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow(UnauthorizedError);
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow('Sesión inválida o expirada');
    });

    it('debe rechazar cuando la sesión ha expirado', async () => {
      // Arrange
      const mockPayload = { sub: 1 };
      const mockSesion = {
        tokenRefresh: 'valid-refresh-token',
        activo: true,
        fechaExpiracion: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día en el pasado
        usuario: {
          idUsuario: 1,
          email: 'test@example.com',
          activo: true,
          roles: []
        }
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      mockPrisma.sesionUsuario.findUnique.mockResolvedValue(mockSesion);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow(UnauthorizedError);
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow('Sesión inválida o expirada');
    });

    it('debe rechazar cuando el usuario está inactivo', async () => {
      // Arrange
      const mockPayload = { sub: 1 };
      const mockSesion = {
        tokenRefresh: 'valid-refresh-token',
        activo: true,
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usuario: {
          idUsuario: 1,
          email: 'test@example.com',
          activo: false,
          roles: []
        }
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      mockPrisma.sesionUsuario.findUnique.mockResolvedValue(mockSesion);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow(UnauthorizedError);
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow('Usuario no autorizado');
    });

    it('debe manejar errores internos durante la renovación', async () => {
      // Arrange
      const mockPayload = { sub: 1 };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      mockPrisma.sesionUsuario.findUnique.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow(BadRequestError);
      await expect(authService.refreshToken(refreshTokenDto))
        .rejects.toThrow('Error interno del servidor durante la renovación del token');
    });
  });

  describe('logoutAll', () => {
    it('debe cerrar todas las sesiones de un usuario', async () => {
      // Arrange
      const userId = 1;
      mockPrisma.sesionUsuario.deleteMany.mockResolvedValue({ count: 3 });

      // Act
      await authService.logoutAll(userId);

      // Assert
      expect(mockPrisma.sesionUsuario.deleteMany).toHaveBeenCalledWith({
        where: { idUsuario: userId }
      });
    });

    it('debe manejar errores al cerrar todas las sesiones', async () => {
      // Arrange
      const userId = 1;
      mockPrisma.sesionUsuario.deleteMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.logoutAll(userId))
        .rejects.toThrow(BadRequestError);
      await expect(authService.logoutAll(userId))
        .rejects.toThrow('Error al cerrar todas las sesiones');
    });
  });

  describe('getActiveSessions', () => {
    it('debe obtener todas las sesiones activas de un usuario', async () => {
      // Arrange
      const userId = 1;
      const mockSesiones = [
        {
          idSesion: 1,
          fechaCreacion: new Date(),
          fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        },
        {
          idSesion: 2,
          fechaCreacion: new Date(),
          fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: '192.168.1.2',
          userAgent: 'Chrome'
        }
      ];

      mockPrisma.sesionUsuario.findMany.mockResolvedValue(mockSesiones);

      // Act
      const result = await authService.getActiveSessions(userId);

      // Assert
      expect(result).toEqual(mockSesiones);
      expect(mockPrisma.sesionUsuario.findMany).toHaveBeenCalledWith({
        where: { 
          idUsuario: userId,
          activo: true,
          fechaExpiracion: {
            gte: expect.any(Date)
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
    });

    it('debe manejar errores al obtener sesiones activas', async () => {
      // Arrange
      const userId = 1;
      mockPrisma.sesionUsuario.findMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.getActiveSessions(userId))
        .rejects.toThrow(BadRequestError);
      await expect(authService.getActiveSessions(userId))
        .rejects.toThrow('Error al obtener sesiones activas');
    });
  });

  describe('getExpirationDate', () => {
    it('debe calcular correctamente la fecha de expiración para segundos', () => {
      // Act
      const result = (authService as any).getExpirationDate('30s');
      
      // Assert
      const expected = new Date(Date.now() + 30 * 1000);
      expect(result.getTime()).toBeCloseTo(expected.getTime(), -2); // Tolerancia de ~100ms
    });

    it('debe calcular correctamente la fecha de expiración para minutos', () => {
      // Act
      const result = (authService as any).getExpirationDate('15m');
      
      // Assert
      const expected = new Date(Date.now() + 15 * 60 * 1000);
      expect(result.getTime()).toBeCloseTo(expected.getTime(), -2);
    });

    it('debe calcular correctamente la fecha de expiración para horas', () => {
      // Act
      const result = (authService as any).getExpirationDate('2h');
      
      // Assert
      const expected = new Date(Date.now() + 2 * 60 * 60 * 1000);
      expect(result.getTime()).toBeCloseTo(expected.getTime(), -2);
    });

    it('debe calcular correctamente la fecha de expiración para días', () => {
      // Act
      const result = (authService as any).getExpirationDate('7d');
      
      // Assert
      const expected = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(result.getTime()).toBeCloseTo(expected.getTime(), -2);
    });

    it('debe usar fallback de 7 días para unidades desconocidas', () => {
      // Act
      const result = (authService as any).getExpirationDate('5x');
      
      // Assert
      const expected = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(result.getTime()).toBeCloseTo(expected.getTime(), -2);
    });
  });
});

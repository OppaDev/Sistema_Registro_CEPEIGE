import { AuthService } from '@/api/services/authService/auth.service';
import { LoginDto } from '@/api/dtos/authDto/auth.dto';
import bcrypt from 'bcryptjs';

// Mock Prisma
jest.mock('@prisma/client');
jest.mock('bcryptjs');

const mockPrisma = {
  usuario: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  sesionUsuario: {
    create: jest.fn(),
    findUnique: jest.fn(),
    deleteMany: jest.fn(),
  },
} as any;

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    (authService as any).prisma = mockPrisma;
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('debe autenticar un usuario con credenciales válidas', async () => {
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

    it('debe rechazar credenciales inválidas', async () => {
      // Arrange
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow('Email o contraseña incorrectos');
    });

    it('debe rechazar usuario inactivo', async () => {
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

    it('debe rechazar contraseña incorrecta', async () => {
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
    it('debe cerrar sesión correctamente', async () => {
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

    it('debe manejar graciosamente tokens no encontrados', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      mockPrisma.sesionUsuario.deleteMany.mockResolvedValue({ count: 0 });

      // Act & Assert
      await expect(authService.logout(refreshToken)).resolves.not.toThrow();
    });
  });
});

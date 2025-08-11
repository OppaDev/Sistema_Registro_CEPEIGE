// Mock del cliente Moodle
const mockPost = jest.fn();

jest.mock('@/config/moodleClient', () => ({
  __esModule: true,
  default: {
    post: mockPost,
  },
  moodlePost: mockPost,
}));

// Mock del logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { UsuarioMoodleService } from './usuarioMoodle.service';
import { AppError } from '@/utils/errorTypes';
import type { DatosPersonales } from '@prisma/client';

describe('UsuarioMoodleService', () => {
  let usuarioMoodleService: UsuarioMoodleService;

  const mockDatosPersonales: DatosPersonales = {
    idPersona: 1,
    ciPasaporte: '0402084040',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez González',
    numTelefono: '+593-2-123-4567',
    correo: 'juan.perez@email.com',
    pais: 'Ecuador',
    provinciaEstado: 'Pichincha',
    ciudad: 'Quito',
    profesion: 'Ingeniero de Sistemas',
    institucion: 'Universidad Central del Ecuador',
  };

  beforeEach(() => {
    usuarioMoodleService = new UsuarioMoodleService();
    jest.clearAllMocks();
  });

  describe('crearUsuarioEnMoodle', () => {
    // SRV-INT-010: Crear usuario en Moodle exitosamente
    it('SRV-INT-010: debe crear un usuario en Moodle exitosamente', async () => {
      // Arrange
      const mockResponse = [
        {
          id: 456,
          username: 'juan.perez@email.com',
        }
      ];
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await usuarioMoodleService.crearUsuarioEnMoodle(mockDatosPersonales);

      // Assert
      expect(result).toBe(456);
      expect(mockPost).toHaveBeenCalledWith(
        '',
        expect.any(URLSearchParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      // Verificar que se llamó con los datos correctos
      const formDataCall = mockPost.mock.calls[0][1];
      expect(formDataCall.get('wsfunction')).toBe('core_user_create_users');
      expect(formDataCall.get('users[0][username]')).toBe(mockDatosPersonales.correo);
      expect(formDataCall.get('users[0][firstname]')).toBe(mockDatosPersonales.nombres);
      expect(formDataCall.get('users[0][lastname]')).toBe(mockDatosPersonales.apellidos);
      expect(formDataCall.get('users[0][email]')).toBe(mockDatosPersonales.correo);
      expect(formDataCall.get('users[0][createpassword]')).toBe('1');
    });

    // SRV-INT-011: Maneja respuesta inválida de Moodle
    it('SRV-INT-011: debe manejar respuesta inválida de Moodle', async () => {
      // Arrange
      mockPost.mockResolvedValue([]);

      // Act & Assert
      await expect(usuarioMoodleService.crearUsuarioEnMoodle(mockDatosPersonales))
        .rejects.toThrow(AppError);
      await expect(usuarioMoodleService.crearUsuarioEnMoodle(mockDatosPersonales))
        .rejects.toThrow('Respuesta inválida de Moodle al crear usuario');
    });

    // SRV-INT-012: Maneja usuario sin ID en respuesta
    it('SRV-INT-012: debe manejar usuario sin ID en respuesta', async () => {
      // Arrange
      const mockResponse = [
        {
          username: 'juan.perez@email.com',
          // No ID
        }
      ];
      
      mockPost.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(usuarioMoodleService.crearUsuarioEnMoodle(mockDatosPersonales))
        .rejects.toThrow(AppError);
      await expect(usuarioMoodleService.crearUsuarioEnMoodle(mockDatosPersonales))
        .rejects.toThrow('Moodle no devolvió un ID de usuario válido');
    });

    // SRV-INT-013: Maneja error de conexión con Moodle
    it('SRV-INT-013: debe manejar error de conexión con Moodle', async () => {
      // Arrange
      mockPost.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(usuarioMoodleService.crearUsuarioEnMoodle(mockDatosPersonales))
        .rejects.toThrow(AppError);
      await expect(usuarioMoodleService.crearUsuarioEnMoodle(mockDatosPersonales))
        .rejects.toThrow('Error al crear usuario en Moodle: Network error');
    });
  });

  describe('obtenerMoodleUserIdPorEmail', () => {
    // SRV-INT-014: Obtener ID de usuario por email
    it('SRV-INT-014: debe obtener ID de usuario por email', async () => {
      // Arrange
      const mockResponse = [
        {
          id: 456,
          email: 'juan.perez@email.com'
        }
      ];
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await usuarioMoodleService.obtenerMoodleUserIdPorEmail('juan.perez@email.com');

      // Assert
      expect(result).toBe(456);
      expect(mockPost).toHaveBeenCalledWith(
        '',
        expect.any(URLSearchParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      const formDataCall = mockPost.mock.calls[0][1];
      expect(formDataCall.get('wsfunction')).toBe('core_user_get_users_by_field');
      expect(formDataCall.get('field')).toBe('email');
      expect(formDataCall.get('values[0]')).toBe('juan.perez@email.com');
    });

    // SRV-INT-015: Retorna null cuando usuario no existe
    it('SRV-INT-015: debe retornar null cuando usuario no existe', async () => {
      // Arrange
      mockPost.mockResolvedValue([]);

      // Act
      const result = await usuarioMoodleService.obtenerMoodleUserIdPorEmail('inexistente@email.com');

      // Assert
      expect(result).toBeNull();
    });

    // SRV-INT-016: Maneja error al buscar usuario
    it('SRV-INT-016: debe manejar error al buscar usuario', async () => {
      // Arrange
      mockPost.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await usuarioMoodleService.obtenerMoodleUserIdPorEmail('test@email.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('verificarUsuarioExiste', () => {
    // SRV-INT-017: Verificar que usuario existe en Moodle
    it('SRV-INT-017: debe verificar que un usuario existe en Moodle', async () => {
      // Arrange
      const mockResponse = [
        {
          id: 456,
          email: 'juan.perez@email.com'
        }
      ];
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await usuarioMoodleService.verificarUsuarioExiste('juan.perez@email.com');

      // Assert
      expect(result).toBe(true);
    });

    // SRV-INT-018: Verificar que usuario no existe en Moodle
    it('SRV-INT-018: debe verificar que un usuario no existe en Moodle', async () => {
      // Arrange
      mockPost.mockResolvedValue([]);

      // Act
      const result = await usuarioMoodleService.verificarUsuarioExiste('inexistente@email.com');

      // Assert
      expect(result).toBe(false);
    });

    // SRV-INT-019: Maneja error al verificar usuario
    it('SRV-INT-019: debe manejar error al verificar usuario', async () => {
      // Arrange
      mockPost.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await usuarioMoodleService.verificarUsuarioExiste('test@email.com');

      // Assert
      expect(result).toBe(false);
    });
  });
});
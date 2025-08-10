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
    warn: jest.fn(),
  },
}));

import { MatriculaMoodleService } from './matriculaMoodle.service';
import { AppError } from '@/utils/errorTypes';

describe('MatriculaMoodleService', () => {
  let matriculaMoodleService: MatriculaMoodleService;

  beforeEach(() => {
    matriculaMoodleService = new MatriculaMoodleService();
    jest.clearAllMocks();
  });

  describe('matricularUsuarioEnCurso', () => {
    // SRV-INT-020: Matricular usuario en curso exitosamente con respuesta vacía
    it('SRV-INT-020: debe matricular usuario exitosamente con respuesta vacía', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 123;
      
      mockPost.mockResolvedValue(null); // Respuesta vacía indica éxito

      // Act
      const result = await matriculaMoodleService.matricularUsuarioEnCurso(
        moodleUserId, 
        moodleCourseId
      );

      // Assert
      expect(result).toBe(true);
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
      expect(formDataCall.get('wsfunction')).toBe('enrol_manual_enrol_users');
      expect(formDataCall.get('enrolments[0][userid]')).toBe('456');
      expect(formDataCall.get('enrolments[0][courseid]')).toBe('123');
      expect(formDataCall.get('enrolments[0][roleid]')).toBe('5'); // Student role
    });

    // SRV-INT-021: Matricular usuario con fechas de inicio y fin
    it('SRV-INT-021: debe matricular usuario con fechas de inicio y fin', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 123;
      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-03-15');
      
      mockPost.mockResolvedValue(null);

      // Act
      const result = await matriculaMoodleService.matricularUsuarioEnCurso(
        moodleUserId, 
        moodleCourseId,
        startDate,
        endDate
      );

      // Assert
      expect(result).toBe(true);
      
      const formDataCall = mockPost.mock.calls[0][1];
      expect(formDataCall.get('enrolments[0][timestart]')).toBe(Math.floor(startDate.getTime() / 1000).toString());
      expect(formDataCall.get('enrolments[0][timeend]')).toBe(Math.floor(endDate.getTime() / 1000).toString());
    });

    // SRV-INT-022: Manejar respuesta con warnings no críticos
    it('SRV-INT-022: debe manejar respuesta con warnings no críticos', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 123;
      
      const mockResponse = {
        warnings: [
          {
            warningcode: 'alreadyenrolled',
            message: 'User is already enrolled'
          }
        ]
      };
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await matriculaMoodleService.matricularUsuarioEnCurso(
        moodleUserId, 
        moodleCourseId
      );

      // Assert
      expect(result).toBe(true);
    });

    // SRV-INT-023: Manejar warnings críticos
    it('SRV-INT-023: debe manejar warnings críticos', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 123;
      
      const mockResponse = {
        warnings: [
          {
            warningcode: 'usernotexist',
            message: 'User does not exist in Moodle'
          }
        ]
      };
      
      mockPost.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(matriculaMoodleService.matricularUsuarioEnCurso(moodleUserId, moodleCourseId))
        .rejects.toThrow(AppError);
      await expect(matriculaMoodleService.matricularUsuarioEnCurso(moodleUserId, moodleCourseId))
        .rejects.toThrow('Error crítico en matrícula: User does not exist in Moodle');
    });

    // SRV-INT-024: Manejar warning de curso no existente
    it('SRV-INT-024: debe manejar warning de curso no existente', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 999;
      
      const mockResponse = {
        warnings: [
          {
            warningcode: 'coursenotexist',
            message: 'Course does not exist'
          }
        ]
      };
      
      mockPost.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(matriculaMoodleService.matricularUsuarioEnCurso(moodleUserId, moodleCourseId))
        .rejects.toThrow(AppError);
      await expect(matriculaMoodleService.matricularUsuarioEnCurso(moodleUserId, moodleCourseId))
        .rejects.toThrow('Error crítico en matrícula: Course does not exist');
    });

    // SRV-INT-025: Manejar warning de matrícula no permitida
    it('SRV-INT-025: debe manejar warning de matrícula no permitida', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 123;
      
      const mockResponse = {
        warnings: [
          {
            warningcode: 'enrolnotpermitted',
            message: 'Enrolment not permitted'
          }
        ]
      };
      
      mockPost.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(matriculaMoodleService.matricularUsuarioEnCurso(moodleUserId, moodleCourseId))
        .rejects.toThrow(AppError);
      await expect(matriculaMoodleService.matricularUsuarioEnCurso(moodleUserId, moodleCourseId))
        .rejects.toThrow('Error crítico en matrícula: Enrolment not permitted');
    });

    // SRV-INT-026: Manejar error de conexión con Moodle
    it('SRV-INT-026: debe manejar error de conexión con Moodle', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 123;
      
      mockPost.mockRejectedValue(new Error('Network timeout'));

      // Act & Assert
      await expect(matriculaMoodleService.matricularUsuarioEnCurso(moodleUserId, moodleCourseId))
        .rejects.toThrow(AppError);
      await expect(matriculaMoodleService.matricularUsuarioEnCurso(moodleUserId, moodleCourseId))
        .rejects.toThrow('Error al matricular usuario en Moodle: Network timeout');
    });
  });

  describe('verificarMatriculaExiste', () => {
    // SRV-INT-027: Verificar que matrícula existe
    it('SRV-INT-027: debe verificar que un usuario está matriculado en un curso', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 123;
      
      const mockResponse = [
        {
          id: 456,
          username: 'juan.perez@email.com',
          firstname: 'Juan',
          lastname: 'Pérez',
          email: 'juan.perez@email.com'
        }
      ];
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await matriculaMoodleService.verificarMatriculaExiste(moodleUserId, moodleCourseId);

      // Assert
      expect(result).toBe(true);
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
      expect(formDataCall.get('wsfunction')).toBe('core_enrol_get_enrolled_users');
      expect(formDataCall.get('courseid')).toBe('123');
    });

    // SRV-INT-028: Verificar que usuario no está matriculado
    it('SRV-INT-028: debe verificar que un usuario no está matriculado en un curso', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 123;
      
      mockPost.mockResolvedValue([]);

      // Act
      const result = await matriculaMoodleService.verificarMatriculaExiste(moodleUserId, moodleCourseId);

      // Assert
      expect(result).toBe(false);
    });

    // SRV-INT-029: Maneja error al verificar matrícula
    it('SRV-INT-029: debe manejar error al verificar matrícula', async () => {
      // Arrange
      const moodleUserId = 456;
      const moodleCourseId = 123;
      
      mockPost.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await matriculaMoodleService.verificarMatriculaExiste(moodleUserId, moodleCourseId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
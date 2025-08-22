// Mock del cliente Moodle
const mockPost = jest.fn();
const mockGet = jest.fn();

jest.mock('@/config/moodleClient', () => ({
  __esModule: true,
  default: {
    post: mockPost,
    get: mockGet,
  },
  moodlePost: mockPost,
  moodleGet: mockGet,
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

import { CursoMoodleService } from './cursoMoodle.service';
import { AppError } from '@/utils/errorTypes';
import { Decimal } from '@prisma/client/runtime/library';
import type { Curso } from '@prisma/client';

describe('CursoMoodleService', () => {
  let cursoMoodleService: CursoMoodleService;

  const mockCurso: Curso = {
    idCurso: 1,
    nombreCortoCurso: 'JS-2024',
    nombreCurso: 'JavaScript Básico',
    modalidadCurso: 'Virtual',
    descripcionCurso: 'Curso de JavaScript desde cero',
    valorCurso: new Decimal(299.99),
    enlacePago: 'https://payment.example.com/test-course',
    fechaInicioCurso: new Date('2025-01-15'),
    fechaFinCurso: new Date('2025-03-15'),
  };

  beforeEach(() => {
    cursoMoodleService = new CursoMoodleService();
    jest.clearAllMocks();
  });

  describe('crearCursoEnMoodle', () => {
    // SRV-INT-001: Crear curso en Moodle exitosamente
    it('SRV-INT-001: debe crear un curso en Moodle exitosamente', async () => {
      // Arrange
      const mockResponse = [
        {
          id: 123,
          shortname: 'js-2024-123456',
        }
      ];
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await cursoMoodleService.crearCursoEnMoodle(mockCurso);

      // Assert
      expect(result).toBe(123);
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
      expect(formDataCall.get('wsfunction')).toBe('core_course_create_courses');
      expect(formDataCall.get('courses[0][fullname]')).toBe(mockCurso.nombreCurso);
      expect(formDataCall.get('courses[0][shortname]')).toContain('js-2024');
    });

    // SRV-INT-002: Maneja respuesta inválida de Moodle
    it('SRV-INT-002: debe manejar respuesta inválida de Moodle', async () => {
      // Arrange
      mockPost.mockResolvedValue(null);

      // Act & Assert
      await expect(cursoMoodleService.crearCursoEnMoodle(mockCurso))
        .rejects.toThrow(AppError);
      await expect(cursoMoodleService.crearCursoEnMoodle(mockCurso))
        .rejects.toThrow('Respuesta inválida de Moodle al crear curso');
    });

    // SRV-INT-003: Maneja respuesta con warnings
    it('SRV-INT-003: debe manejar respuesta con warnings', async () => {
      // Arrange
      const mockResponse = [
        {
          warnings: [
            {
              item: 'course',
              itemid: 0,
              warningcode: 'courseshortnamenotunique',
              message: 'Course shortname already exists'
            }
          ]
        }
      ];
      
      mockPost.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(cursoMoodleService.crearCursoEnMoodle(mockCurso))
        .rejects.toThrow(AppError);
      await expect(cursoMoodleService.crearCursoEnMoodle(mockCurso))
        .rejects.toThrow('Advertencias de Moodle al crear curso');
    });

    // SRV-INT-004: Maneja error de conexión con Moodle
    it('SRV-INT-004: debe manejar error de conexión con Moodle', async () => {
      // Arrange
      mockPost.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(cursoMoodleService.crearCursoEnMoodle(mockCurso))
        .rejects.toThrow(AppError);
      await expect(cursoMoodleService.crearCursoEnMoodle(mockCurso))
        .rejects.toThrow('Error al crear curso en Moodle: Network error');
    });
  });

  describe('verificarCursoExiste', () => {
    // SRV-INT-005: Verificar que curso existe en Moodle
    it('SRV-INT-005: debe verificar que un curso existe en Moodle', async () => {
      // Arrange
      const mockResponse = {
        courses: [
          {
            id: 123,
            shortname: 'JS-2024',
            fullname: 'JavaScript Básico'
          }
        ]
      };
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await cursoMoodleService.verificarCursoExiste('JS-2024');

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
    });

    // SRV-INT-006: Verificar que curso no existe en Moodle
    it('SRV-INT-006: debe verificar que un curso no existe en Moodle', async () => {
      // Arrange
      const mockResponse = {
        courses: []
      };
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await cursoMoodleService.verificarCursoExiste('INEXISTENTE');

      // Assert
      expect(result).toBe(false);
    });

    // SRV-INT-007: Maneja error al verificar curso
    it('SRV-INT-007: debe manejar error al verificar curso', async () => {
      // Arrange
      mockPost.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await cursoMoodleService.verificarCursoExiste('JS-2024');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('obtenerMoodleCourseIdPorShortname', () => {
    // SRV-INT-008: Obtener ID de curso por shortname
    it('SRV-INT-008: debe obtener ID de curso por shortname', async () => {
      // Arrange
      const mockResponse = {
        courses: [
          {
            id: 123,
            shortname: 'JS-2024'
          }
        ]
      };
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await cursoMoodleService.obtenerMoodleCourseIdPorShortname('JS-2024');

      // Assert
      expect(result).toBe(123);
    });

    // SRV-INT-009: Retorna null cuando curso no existe
    it('SRV-INT-009: debe retornar null cuando curso no existe', async () => {
      // Arrange
      const mockResponse = {
        courses: []
      };
      
      mockPost.mockResolvedValue(mockResponse);

      // Act
      const result = await cursoMoodleService.obtenerMoodleCourseIdPorShortname('INEXISTENTE');

      // Assert
      expect(result).toBeNull();
    });
  });
});
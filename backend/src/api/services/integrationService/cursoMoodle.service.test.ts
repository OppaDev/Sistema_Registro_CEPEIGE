import { CursoMoodleService } from './cursoMoodle.service';
import { NotFoundError, ConflictError, AppError } from '@/utils/errorTypes';
import { Decimal } from '@prisma/client/runtime/library';
import { 
  toCursoMoodleResponseDto, 
  toCursoMoodleWithCursoDto 
} from '@/api/services/mappers/integrationMapper/cursoMoodle.mapper';

// Mock Prisma con variables definidas dentro del mock
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    curso: {
      findUnique: jest.fn(),
    },
    cursoMoodle: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  })),
  Decimal: jest.requireActual('@prisma/client/runtime/library').Decimal,
}));

// Mock del mapper
jest.mock('@/api/services/mappers/integrationMapper/cursoMoodle.mapper', () => ({
  toCursoMoodleResponseDto: jest.fn(),
  toCursoMoodleWithCursoDto: jest.fn(),
}));

// Mock del logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('CursoMoodleService', () => {
  let service: CursoMoodleService;
  let mockPrismaCurso: any;
  let mockPrismaCursoMoodle: any;

  const mockCurso = {
    idCurso: 1,
    nombreCortoCurso: 'JS-2024',
    nombreCurso: 'JavaScript Básico',
    modalidadCurso: 'Virtual',
    descripcionCurso: 'Curso de JavaScript desde cero',
    valorCurso: new Decimal(299.99),
    enlacePago: 'https://payment.example.com/test-course',
    fechaInicioCurso: new Date('2025-01-15T00:00:00Z'),
    fechaFinCurso: new Date('2025-03-15T00:00:00Z'),
  };

  const mockCursoMoodle = {
    idCursoMoodle: 1,
    idCurso: 1,
    moodleCursoId: 123,
    nombreCortoMoodle: 'js_basico_2024',
    activo: true,
    fechaCreacion: new Date('2025-01-15T10:00:00Z'),
    fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
  };

  const mockCreateCursoMoodleDto = {
    idCurso: 1,
    moodleCursoId: 123,
    nombreCortoMoodle: 'js_basico_2024',
    activo: true,
  };

  beforeEach(() => {
    service = new CursoMoodleService();
    
    // Obtener referencias a los mocks
    const prismaInstance = (service as any).prisma || new (require('@prisma/client').PrismaClient)();
    mockPrismaCurso = prismaInstance.curso;
    mockPrismaCursoMoodle = prismaInstance.cursoMoodle;
    
    jest.clearAllMocks();
    
    // Setup default mapper returns
    (toCursoMoodleResponseDto as jest.Mock).mockReturnValue({
      idCursoMoodle: 1,
      idCurso: 1,
      moodleCursoId: 123,
      nombreCortoMoodle: 'js_basico_2024',
      activo: true,
      fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
    });
    
    (toCursoMoodleWithCursoDto as jest.Mock).mockReturnValue({
      idCursoMoodle: 1,
      idCurso: 1,
      moodleCursoId: 123,
      nombreCortoMoodle: 'js_basico_2024',
      activo: true,
      fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
      curso: {
        idCurso: 1,
        nombreCortoCurso: 'JS-2024',
        nombreCurso: 'JavaScript Básico',
      },
    });
  });

  describe('Instanciación', () => {
    // SRV-CM-001: Verificar que el servicio se puede instanciar
    it('SRV-CM-001: debe instanciar el servicio correctamente', () => {
      expect(service).toBeInstanceOf(CursoMoodleService);
      expect(service.createCursoMoodle).toBeDefined();
      expect(service.getAllCursosMoodle).toBeDefined();
      expect(service.getCursoMoodleByIdCurso).toBeDefined();
      expect(service.updateCursoMoodle).toBeDefined();
      expect(service.deleteCursoMoodle).toBeDefined();
    });
  });

  // Test simple que no requiere interacción con DB
  describe('Métodos públicos', () => {
    it('SRV-CM-002: debe tener todos los métodos públicos definidos', () => {
      expect(typeof service.createCursoMoodle).toBe('function');
      expect(typeof service.getAllCursosMoodle).toBe('function');
      expect(typeof service.getCursoMoodleByIdCurso).toBe('function');
      expect(typeof service.updateCursoMoodle).toBe('function');
      expect(typeof service.deleteCursoMoodle).toBe('function');
      expect(typeof service.existeIntegracionMoodle).toBe('function');
      expect(typeof service.obtenerMoodleCursoId).toBe('function');
    });
  });

  describe('createCursoMoodle', () => {
    
    // SRV-CM-003: Crear integración Moodle exitosamente
    it('SRV-CM-003: debe crear integración Moodle exitosamente', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(mockCurso);
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);
      mockPrismaCursoMoodle.findFirst.mockResolvedValue(null);
      mockPrismaCursoMoodle.create.mockResolvedValue(mockCursoMoodle);

      // Act
      const result = await service.createCursoMoodle(mockCreateCursoMoodleDto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaCurso.findUnique).toHaveBeenCalledWith({ where: { idCurso: 1 } });
      expect(mockPrismaCursoMoodle.create).toHaveBeenCalledWith({
        data: {
          idCurso: 1,
          moodleCursoId: 123,
          nombreCortoMoodle: 'js_basico_2024',
          activo: true,
        }
      });
      expect(toCursoMoodleResponseDto).toHaveBeenCalledWith(mockCursoMoodle);
    });

    // SRV-CM-004: Error cuando curso no existe
    it('SRV-CM-004: debe lanzar NotFoundError cuando el curso no existe', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow(NotFoundError);
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow('Curso con ID 1');
    });

    // SRV-CM-005: Error cuando ya existe integración
    it('SRV-CM-005: debe lanzar ConflictError cuando ya existe integración', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(mockCurso);
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow(ConflictError);
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow('El curso con ID 1 ya tiene una integración con Moodle');
    });

    // SRV-CM-006: Error cuando ID de Moodle ya está en uso
    it('SRV-CM-006: debe lanzar ConflictError cuando ID de Moodle ya está en uso', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(mockCurso);
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);
      mockPrismaCursoMoodle.findFirst.mockResolvedValue(mockCursoMoodle);

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow(ConflictError);
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow('El ID de curso en Moodle 123 ya está en uso');
    });

    // SRV-CM-007: Crear con activo por defecto
    it('SRV-CM-007: debe crear con activo=true por defecto', async () => {
      // Arrange
      const dtoSinActivo = { ...mockCreateCursoMoodleDto };
      delete (dtoSinActivo as any).activo;
      
      mockPrismaCurso.findUnique.mockResolvedValue(mockCurso);
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);
      mockPrismaCursoMoodle.findFirst.mockResolvedValue(null);
      mockPrismaCursoMoodle.create.mockResolvedValue(mockCursoMoodle);

      // Act
      await service.createCursoMoodle(dtoSinActivo);

      // Assert
      expect(mockPrismaCursoMoodle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          activo: true,
        })
      });
    });

    // SRV-CM-008: Manejar errores genéricos
    it('SRV-CM-008: debe manejar errores genéricos correctamente', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow(AppError);
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow('Error al crear integración Moodle: Database error');
    });

    // SRV-CM-009: Propagar AppError existente
    it('SRV-CM-009: debe propagar AppError existente sin envolver', async () => {
      // Arrange
      const existingAppError = new ConflictError('Custom conflict');
      mockPrismaCurso.findUnique.mockRejectedValue(existingAppError);

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toBe(existingAppError);
    });

    // SRV-CM-010: Manejar errores desconocidos
    it('SRV-CM-010: debe manejar errores desconocidos', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockRejectedValue('String error');

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow('Error desconocido al crear integración Moodle');
    });
  });

  describe('updateCursoMoodle', () => {
    
    const mockUpdateDto = {
      moodleCursoId: 456,
      nombreCortoMoodle: 'js_intermedio_2024',
      activo: false,
    };

    // SRV-CM-011: Actualizar integración exitosamente
    it('SRV-CM-011: debe actualizar integración Moodle exitosamente', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);
      mockPrismaCursoMoodle.findFirst.mockResolvedValue(null);
      mockPrismaCursoMoodle.update.mockResolvedValue({ ...mockCursoMoodle, ...mockUpdateDto });

      // Act
      const result = await service.updateCursoMoodle(1, mockUpdateDto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaCursoMoodle.update).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        data: mockUpdateDto
      });
    });

    // SRV-CM-012: Error cuando integración no existe
    it('SRV-CM-012: debe lanzar NotFoundError cuando la integración no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateCursoMoodle(1, mockUpdateDto))
        .rejects.toThrow(NotFoundError);
      await expect(service.updateCursoMoodle(1, mockUpdateDto))
        .rejects.toThrow('Integración Moodle para curso con ID 1');
    });

    // SRV-CM-013: Error cuando nuevo ID de Moodle está en uso
    it('SRV-CM-013: debe lanzar ConflictError cuando nuevo ID está en uso', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);
      mockPrismaCursoMoodle.findFirst.mockResolvedValue({ ...mockCursoMoodle, idCurso: 2 });

      // Act & Assert
      await expect(service.updateCursoMoodle(1, mockUpdateDto))
        .rejects.toThrow(ConflictError);
    });

    // SRV-CM-014: Permitir mismo ID de Moodle
    it('SRV-CM-014: debe permitir actualizar con mismo ID de Moodle', async () => {
      // Arrange
      const updateMismoId = { moodleCursoId: 123 };
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);
      mockPrismaCursoMoodle.update.mockResolvedValue(mockCursoMoodle);

      // Act
      await service.updateCursoMoodle(1, updateMismoId);

      // Assert
      expect(mockPrismaCursoMoodle.findFirst).not.toHaveBeenCalled();
    });

    // SRV-CM-015: Actualización parcial con undefined
    it('SRV-CM-015: debe procesar campos undefined correctamente', async () => {
      // Arrange
      const updateParcial: any = {
        moodleCursoId: undefined,
        nombreCortoMoodle: 'nuevo_nombre',
        activo: undefined,
      };
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);
      mockPrismaCursoMoodle.update.mockResolvedValue(mockCursoMoodle);

      // Act
      await service.updateCursoMoodle(1, updateParcial);

      // Assert
      expect(mockPrismaCursoMoodle.update).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        data: { nombreCortoMoodle: 'nuevo_nombre' }
      });
    });
  });

  describe('getCursoMoodleByIdCurso', () => {
    
    const mockCursoMoodleConCurso = {
      ...mockCursoMoodle,
      curso: mockCurso,
    };

    // SRV-CM-016: Obtener integración exitosamente
    it('SRV-CM-016: debe obtener integración por ID de curso', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodleConCurso);

      // Act
      const result = await service.getCursoMoodleByIdCurso(1);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaCursoMoodle.findUnique).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        include: { curso: true }
      });
      expect(toCursoMoodleWithCursoDto).toHaveBeenCalledWith(mockCursoMoodleConCurso);
    });

    // SRV-CM-017: Error cuando integración no existe
    it('SRV-CM-017: debe lanzar NotFoundError cuando no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCursoMoodleByIdCurso(1))
        .rejects.toThrow(NotFoundError);
      await expect(service.getCursoMoodleByIdCurso(1))
        .rejects.toThrow('Integración Moodle para curso con ID 1');
    });
  });

  describe('getAllCursosMoodle', () => {
    
    const mockOptions = {
      page: 1,
      limit: 10,
      orderBy: 'fechaCreacion',
      order: 'desc' as 'desc',
      incluirInactivos: false,
    };

    // SRV-CM-018: Obtener con paginación
    it('SRV-CM-018: debe obtener integraciones con paginación', async () => {
      // Arrange
      const mockCursosMoodle = [mockCursoMoodle];
      mockPrismaCursoMoodle.findMany.mockResolvedValue(mockCursosMoodle);
      mockPrismaCursoMoodle.count.mockResolvedValue(1);

      // Act
      const result = await service.getAllCursosMoodle(mockOptions);

      // Assert
      expect(result.total).toBe(1);
      expect(mockPrismaCursoMoodle.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { activo: true },
        orderBy: { fechaCreacion: 'desc' },
        include: { curso: true }
      });
    });

    // SRV-CM-019: Incluir inactivos
    it('SRV-CM-019: debe incluir inactivos cuando se especifica', async () => {
      // Arrange
      const optionsConInactivos = { ...mockOptions, incluirInactivos: true };
      mockPrismaCursoMoodle.findMany.mockResolvedValue([]);
      mockPrismaCursoMoodle.count.mockResolvedValue(0);

      // Act
      await service.getAllCursosMoodle(optionsConInactivos);

      // Assert
      expect(mockPrismaCursoMoodle.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { fechaCreacion: 'desc' },
        include: { curso: true }
      });
    });

    // SRV-CM-020: Paginación página 2
    it('SRV-CM-020: debe calcular skip correctamente para página 2', async () => {
      // Arrange
      const optionsPagina2 = { ...mockOptions, page: 2 };
      mockPrismaCursoMoodle.findMany.mockResolvedValue([]);
      mockPrismaCursoMoodle.count.mockResolvedValue(0);

      // Act
      await service.getAllCursosMoodle(optionsPagina2);

      // Assert
      expect(mockPrismaCursoMoodle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10 })
      );
    });
  });

  describe('deleteCursoMoodle', () => {
    
    // SRV-CM-021: Eliminar integración exitosamente
    it('SRV-CM-021: debe eliminar integración exitosamente', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);
      mockPrismaCursoMoodle.delete.mockResolvedValue(mockCursoMoodle);

      // Act
      const result = await service.deleteCursoMoodle(1);

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaCursoMoodle.delete).toHaveBeenCalledWith({
        where: { idCurso: 1 }
      });
    });

    // SRV-CM-022: Error cuando no existe
    it('SRV-CM-022: debe lanzar NotFoundError cuando no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteCursoMoodle(1))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('existeIntegracionMoodle', () => {
    
    // SRV-CM-023: Verificar existencia
    it('SRV-CM-023: debe retornar true cuando existe y está activa', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);

      // Act
      const result = await service.existeIntegracionMoodle(1);

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaCursoMoodle.findUnique).toHaveBeenCalledWith({
        where: { idCurso: 1, activo: true }
      });
    });

    // SRV-CM-024: No existe
    it('SRV-CM-024: debe retornar false cuando no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.existeIntegracionMoodle(1);

      // Assert
      expect(result).toBe(false);
    });

    // SRV-CM-025: Error en verificación
    it('SRV-CM-025: debe retornar false cuando hay error', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await service.existeIntegracionMoodle(1);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('obtenerMoodleCursoId', () => {
    
    // SRV-CM-026: Obtener ID exitosamente
    it('SRV-CM-026: debe obtener ID de curso Moodle', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);

      // Act
      const result = await service.obtenerMoodleCursoId(1);

      // Assert
      expect(result).toBe(123);
    });

    // SRV-CM-027: Retornar null cuando no existe
    it('SRV-CM-027: debe retornar null cuando no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.obtenerMoodleCursoId(1);

      // Assert
      expect(result).toBe(null);
    });

    // SRV-CM-028: Error en obtención
    it('SRV-CM-028: debe retornar null cuando hay error', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await service.obtenerMoodleCursoId(1);

      // Assert
      expect(result).toBe(null);
    });
  });
});
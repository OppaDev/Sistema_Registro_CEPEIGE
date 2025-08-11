import { CursoMoodleService } from './cursoMoodle.service';
import { NotFoundError, ConflictError, AppError } from '@/utils/errorTypes';
import { Decimal } from '@prisma/client/runtime/library';

// Mock Prisma evitando problemas de hoisting
var mockPrismaCurso: any;
var mockPrismaCursoMoodle: any;

jest.mock('@prisma/client', () => {
  mockPrismaCurso = {
    findUnique: jest.fn(),
  };

  mockPrismaCursoMoodle = {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      curso: mockPrismaCurso,
      cursoMoodle: mockPrismaCursoMoodle,
    })),
    Decimal: jest.requireActual('@prisma/client/runtime/library').Decimal,
  };
});

// Mock del mapper
var mockToCursoMoodleResponseDto: any;
var mockToCursoMoodleWithCursoDto: any;

jest.mock('@/api/services/mappers/integrationMapper/cursoMoodle.mapper', () => {
  mockToCursoMoodleResponseDto = jest.fn();
  mockToCursoMoodleWithCursoDto = jest.fn();
  
  return {
    toCursoMoodleResponseDto: mockToCursoMoodleResponseDto,
    toCursoMoodleWithCursoDto: mockToCursoMoodleWithCursoDto,
  };
});

// Mock del logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('CursoMoodleService - Integration Tests', () => {
  let service: CursoMoodleService;

  const mockCurso = {
    idCurso: 1,
    nombreCortoCurso: 'JS-2024',
    nombreCurso: 'JavaScript Básico',
    modalidadCurso: 'Virtual',
    descripcionCurso: 'Curso de JavaScript desde cero',
    valorCurso: new Decimal(299.99),
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
    jest.clearAllMocks();
    
    // Setup default mapper returns
    mockToCursoMoodleResponseDto.mockReturnValue({
      idCursoMoodle: 1,
      idCurso: 1,
      moodleCursoId: 123,
      nombreCortoMoodle: 'js_basico_2024',
      activo: true,
      fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
    });
    
    mockToCursoMoodleWithCursoDto.mockReturnValue({
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

  describe('createCursoMoodle', () => {
    
    it('debe crear integración Moodle exitosamente', async () => {
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
      expect(mockToCursoMoodleResponseDto).toHaveBeenCalledWith(mockCursoMoodle);
    });

    it('debe lanzar NotFoundError cuando el curso no existe', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow(NotFoundError);
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow('Curso con ID 1');
    });

    it('debe lanzar ConflictError cuando ya existe integración', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(mockCurso);
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow(ConflictError);
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow('El curso con ID 1 ya tiene una integración con Moodle');
    });

    it('debe lanzar ConflictError cuando ID de Moodle ya está en uso', async () => {
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

    it('debe crear con activo=true por defecto', async () => {
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

    it('debe manejar errores genéricos correctamente', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow(AppError);
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toThrow('Error al crear integración Moodle: Database error');
    });

    it('debe propagar AppError existente sin envolver', async () => {
      // Arrange
      const existingAppError = new ConflictError('Custom conflict');
      mockPrismaCurso.findUnique.mockRejectedValue(existingAppError);

      // Act & Assert
      await expect(service.createCursoMoodle(mockCreateCursoMoodleDto))
        .rejects.toBe(existingAppError);
    });

    it('debe manejar errores desconocidos', async () => {
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

    it('debe actualizar integración Moodle exitosamente', async () => {
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

    it('debe lanzar NotFoundError cuando la integración no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateCursoMoodle(1, mockUpdateDto))
        .rejects.toThrow(NotFoundError);
      await expect(service.updateCursoMoodle(1, mockUpdateDto))
        .rejects.toThrow('Integración Moodle para curso con ID 1');
    });

    it('debe lanzar ConflictError cuando nuevo ID está en uso', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);
      mockPrismaCursoMoodle.findFirst.mockResolvedValue({ ...mockCursoMoodle, idCurso: 2 });

      // Act & Assert
      await expect(service.updateCursoMoodle(1, mockUpdateDto))
        .rejects.toThrow(ConflictError);
    });

    it('debe permitir actualizar con mismo ID de Moodle', async () => {
      // Arrange
      const updateMismoId = { moodleCursoId: 123 };
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);
      mockPrismaCursoMoodle.update.mockResolvedValue(mockCursoMoodle);

      // Act
      await service.updateCursoMoodle(1, updateMismoId);

      // Assert
      expect(mockPrismaCursoMoodle.findFirst).not.toHaveBeenCalled();
    });

    it('debe procesar campos undefined correctamente', async () => {
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

    it('debe obtener integración por ID de curso', async () => {
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
      expect(mockToCursoMoodleWithCursoDto).toHaveBeenCalledWith(mockCursoMoodleConCurso);
    });

    it('debe lanzar NotFoundError cuando no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCursoMoodleByIdCurso(1))
        .rejects.toThrow(NotFoundError);
      await expect(service.getCursoMoodleByIdCurso(1))
        .rejects.toThrow('Integración Moodle para curso con ID 1');
    });

    it('debe manejar errores genéricos en obtención', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockRejectedValue(new Error('Query error'));

      // Act & Assert
      await expect(service.getCursoMoodleByIdCurso(1))
        .rejects.toThrow(AppError);
      await expect(service.getCursoMoodleByIdCurso(1))
        .rejects.toThrow('Error al obtener integración Moodle: Query error');
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

    it('debe obtener integraciones con paginación', async () => {
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

    it('debe incluir inactivos cuando se especifica', async () => {
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

    it('debe calcular skip correctamente para página 2', async () => {
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

    it('debe manejar errores genéricos en getAllCursosMoodle', async () => {
      // Arrange
      mockPrismaCursoMoodle.findMany.mockRejectedValue(new Error('Query failed'));

      // Act & Assert
      await expect(service.getAllCursosMoodle(mockOptions))
        .rejects.toThrow(AppError);
      await expect(service.getAllCursosMoodle(mockOptions))
        .rejects.toThrow('Error al obtener integraciones Moodle: Query failed');
    });

    it('debe manejar errores desconocidos en getAllCursosMoodle', async () => {
      // Arrange
      mockPrismaCursoMoodle.findMany.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(service.getAllCursosMoodle(mockOptions))
        .rejects.toThrow(AppError);
      await expect(service.getAllCursosMoodle(mockOptions))
        .rejects.toThrow('Error desconocido al obtener integraciones Moodle');
    });
  });

  describe('deleteCursoMoodle', () => {
    
    it('debe eliminar integración exitosamente', async () => {
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

    it('debe lanzar NotFoundError cuando no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteCursoMoodle(1))
        .rejects.toThrow(NotFoundError);
    });

    it('debe manejar errores genéricos en eliminación', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockRejectedValue(new Error('Delete error'));

      // Act & Assert
      await expect(service.deleteCursoMoodle(1))
        .rejects.toThrow(AppError);
      await expect(service.deleteCursoMoodle(1))
        .rejects.toThrow('Error al eliminar integración Moodle: Delete error');
    });
  });

  describe('existeIntegracionMoodle', () => {
    
    it('debe retornar true cuando existe y está activa', async () => {
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

    it('debe retornar false cuando no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.existeIntegracionMoodle(1);

      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar false cuando hay error', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await service.existeIntegracionMoodle(1);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('obtenerMoodleCursoId', () => {
    
    it('debe obtener ID de curso Moodle', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(mockCursoMoodle);

      // Act
      const result = await service.obtenerMoodleCursoId(1);

      // Assert
      expect(result).toBe(123);
      expect(mockPrismaCursoMoodle.findUnique).toHaveBeenCalledWith({
        where: { idCurso: 1, activo: true }
      });
    });

    it('debe retornar null cuando no hay ID', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue({ ...mockCursoMoodle, moodleCursoId: null });

      // Act
      const result = await service.obtenerMoodleCursoId(1);

      // Assert
      expect(result).toBe(null);
    });

    it('debe retornar null cuando no existe', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.obtenerMoodleCursoId(1);

      // Assert
      expect(result).toBe(null);
    });

    it('debe retornar null cuando hay error', async () => {
      // Arrange
      mockPrismaCursoMoodle.findUnique.mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await service.obtenerMoodleCursoId(1);

      // Assert
      expect(result).toBe(null);
    });
  });
});
import { CursoService } from './curso.service';
import { CreateCursoDto, UpdateCursoDto } from '@/api/dtos/curso.dto';
import { NotFoundError } from '@/utils/errorTypes';

// Mock del módulo Prisma
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    curso: {
      create: mockCreate,
      update: mockUpdate,
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      delete: mockDelete,
      count: mockCount,
    },
  })),
}));

// Mock del mapper
const mockToCursoResponseDto = jest.fn();
jest.mock('@/api/services/mappers/curso.mapper', () => ({
  toCursoResponseDto: mockToCursoResponseDto,
}));

describe('CursoService', () => {
  let cursoService: CursoService;

  beforeEach(() => {
    cursoService = new CursoService();
    jest.clearAllMocks();
    
    // Mock por defecto del mapper
    mockToCursoResponseDto.mockImplementation((curso) => ({
      idCurso: curso.idCurso,
      nombreCortoCurso: curso.nombreCortoCurso,
      nombreCurso: curso.nombreCurso,
      modalidadCurso: curso.modalidadCurso,
      descripcionCurso: curso.descripcionCurso,
      valorCurso: curso.valorCurso,
      fechaInicioCurso: curso.fechaInicioCurso,
      fechaFinCurso: curso.fechaFinCurso,
    }));
  });

  describe('createCurso', () => {
    const validCreateCursoDto: CreateCursoDto = {
      nombreCortoCurso: 'JS101',
      nombreCurso: 'Introducción a JavaScript',
      modalidadCurso: 'Virtual',
      descripcionCurso: 'Curso básico de JavaScript',
      valorCurso: 150.00 as any,
      fechaInicioCurso: '2025-07-01',
      fechaFinCurso: '2025-07-30',
    };

    const mockCursoCreated = {
      idCurso: 1,
      nombreCortoCurso: 'JS101',
      nombreCurso: 'Introducción a JavaScript',
      modalidadCurso: 'Virtual',
      descripcionCurso: 'Curso básico de JavaScript',
      valorCurso: 150.00,
      fechaInicioCurso: new Date('2025-07-01'),
      fechaFinCurso: new Date('2025-07-30'),
    };

    it('debería crear un curso exitosamente', async () => {
      // Arrange
      mockCreate.mockResolvedValue(mockCursoCreated);

      // Act
      const result = await cursoService.createCurso(validCreateCursoDto);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          nombreCortoCurso: validCreateCursoDto.nombreCortoCurso,
          nombreCurso: validCreateCursoDto.nombreCurso,
          modalidadCurso: validCreateCursoDto.modalidadCurso,
          descripcionCurso: validCreateCursoDto.descripcionCurso,
          valorCurso: validCreateCursoDto.valorCurso,
          fechaInicioCurso: new Date('2025-07-01'),
          fechaFinCurso: new Date('2025-07-30'),
        },
      });
      expect(mockToCursoResponseDto).toHaveBeenCalledWith(mockCursoCreated);
      expect(result).toEqual(mockCursoCreated);
    });

    it('debería lanzar error si la fecha de inicio es anterior a hoy', async () => {
      // Arrange
      const invalidDto = {
        ...validCreateCursoDto,
        fechaInicioCurso: '2024-01-01', // Fecha pasada
      };

      // Act & Assert
      await expect(cursoService.createCurso(invalidDto))
        .rejects
        .toThrow('Error al crear el curso: La fecha de inicio debe ser mayor o igual a la fecha actual');

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debería lanzar error si la fecha de inicio es posterior a la fecha de fin', async () => {
      // Arrange
      const invalidDto = {
        ...validCreateCursoDto,
        fechaInicioCurso: '2025-08-01',
        fechaFinCurso: '2025-07-30', // Fecha de fin anterior a inicio
      };

      // Act & Assert
      await expect(cursoService.createCurso(invalidDto))
        .rejects
        .toThrow('Error al crear el curso: La fecha de inicio no puede ser posterior a la fecha de fin');

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debería manejar errores de Prisma', async () => {
      // Arrange
      mockCreate.mockRejectedValue(new Error('Error de base de datos'));

      // Act & Assert
      await expect(cursoService.createCurso(validCreateCursoDto))
        .rejects
        .toThrow('Error al crear el curso: Error de base de datos');
    });
  });

  describe('updateCurso', () => {
    const validUpdateDto: UpdateCursoDto = {
      nombreCurso: 'JavaScript Avanzado',
      valorCurso: 200.00 as any,
    };

    const mockExistingCurso = {
      idCurso: 1,
      nombreCortoCurso: 'JS101',
      nombreCurso: 'Introducción a JavaScript',
      modalidadCurso: 'Virtual',
      descripcionCurso: 'Curso básico de JavaScript',
      valorCurso: 150.00,
      fechaInicioCurso: new Date('2025-07-01'),
      fechaFinCurso: new Date('2025-07-30'),
    };

    const mockUpdatedCurso = {
      ...mockExistingCurso,
      nombreCurso: 'JavaScript Avanzado',
      valorCurso: 200.00,
    };

    it('debería actualizar un curso exitosamente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockExistingCurso);
      mockUpdate.mockResolvedValue(mockUpdatedCurso);

      // Act
      await cursoService.updateCurso(1, validUpdateDto);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idCurso: 1 },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        data: validUpdateDto,
      });
      expect(mockToCursoResponseDto).toHaveBeenCalledWith(mockUpdatedCurso);
    });

    it('debería lanzar NotFoundError si el curso no existe', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(cursoService.updateCurso(999, validUpdateDto))
        .rejects
        .toThrow(NotFoundError);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debería validar fechas al actualizar fecha de inicio', async () => {
      // Arrange
      const invalidUpdateDto = {
        fechaInicioCurso: '2024-01-01', // Fecha pasada
      };
      mockFindUnique.mockResolvedValue(mockExistingCurso);

      // Act & Assert
      await expect(cursoService.updateCurso(1, invalidUpdateDto))
        .rejects
        .toThrow('Error al actualizar el curso: La fecha de inicio debe ser mayor o igual a la fecha actual');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debería validar coherencia de fechas al actualizar', async () => {
      // Arrange
      const invalidUpdateDto = {
        fechaInicioCurso: '2025-08-01',
        fechaFinCurso: '2025-07-30', // Fecha de fin anterior a inicio
      };
      mockFindUnique.mockResolvedValue(mockExistingCurso);

      // Act & Assert
      await expect(cursoService.updateCurso(1, invalidUpdateDto))
        .rejects
        .toThrow('Error al actualizar el curso: La fecha de inicio no puede ser posterior a la fecha de fin');

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('getAllCursos', () => {
    const mockCursos = [
      {
        idCurso: 1,
        nombreCortoCurso: 'JS101',
        nombreCurso: 'Introducción a JavaScript',
        modalidadCurso: 'Virtual',
        descripcionCurso: 'Curso básico de JavaScript',
        valorCurso: 150.00,
        fechaInicioCurso: new Date('2025-07-01'),
        fechaFinCurso: new Date('2025-07-30'),
      },
      {
        idCurso: 2,
        nombreCortoCurso: 'PY101',
        nombreCurso: 'Introducción a Python',
        modalidadCurso: 'Presencial',
        descripcionCurso: 'Curso básico de Python',
        valorCurso: 180.00,
        fechaInicioCurso: new Date('2025-08-01'),
        fechaFinCurso: new Date('2025-08-30'),
      },
    ];

    const options = {
      page: 1,
      limit: 10,
      orderBy: 'fechaInicioCurso',
      order: 'asc' as const,
    };

    it('debería obtener todos los cursos con paginación', async () => {
      // Arrange
      mockFindMany.mockResolvedValue(mockCursos);
      mockCount.mockResolvedValue(2);

      // Act
      const result = await cursoService.getAllCursos(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: {
          fechaInicioCurso: 'asc',
        },
      });
      expect(mockCount).toHaveBeenCalled();
      expect(result.total).toBe(2);
      expect(result.cursos).toHaveLength(2);
      expect(mockToCursoResponseDto).toHaveBeenCalledTimes(2);
    });

    it('debería calcular correctamente el skip para paginación', async () => {
      // Arrange
      const optionsPage2 = { ...options, page: 2, limit: 5 };
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await cursoService.getAllCursos(optionsPage2);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 5, // (page 2 - 1) * limit 5 = 5
        take: 5,
        orderBy: {
          fechaInicioCurso: 'asc',
        },
      });
    });

    it('debería manejar errores al obtener cursos', async () => {
      // Arrange
      mockFindMany.mockRejectedValue(new Error('Error de base de datos'));

      // Act & Assert
      await expect(cursoService.getAllCursos(options))
        .rejects
        .toThrow('Error al obtener los cursos: Error de base de datos');
    });
  });

  describe('getCursoById', () => {
    const mockCurso = {
      idCurso: 1,
      nombreCortoCurso: 'JS101',
      nombreCurso: 'Introducción a JavaScript',
      modalidadCurso: 'Virtual',
      descripcionCurso: 'Curso básico de JavaScript',
      valorCurso: 150.00,
      fechaInicioCurso: new Date('2025-07-01'),
      fechaFinCurso: new Date('2025-07-30'),
    };

    it('debería obtener un curso por ID exitosamente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockCurso);

      // Act
      const result = await cursoService.getCursoById(1);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idCurso: 1 },
      });
      expect(mockToCursoResponseDto).toHaveBeenCalledWith(mockCurso);
      expect(result).toEqual(mockCurso);
    });

    it('debería lanzar NotFoundError si el curso no existe', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(cursoService.getCursoById(999))
        .rejects
        .toThrow(NotFoundError);
    });

    it('debería manejar errores de base de datos', async () => {
      // Arrange
      mockFindUnique.mockRejectedValue(new Error('Error de base de datos'));

      // Act & Assert
      await expect(cursoService.getCursoById(1))
        .rejects
        .toThrow('Error al obtener el curso: Error de base de datos');
    });
  });

  describe('getCursosDisponibles', () => {
    const mockCursosDisponibles = [
      {
        idCurso: 1,
        nombreCurso: 'Introducción a JavaScript',
        modalidadCurso: 'Virtual',
        valorCurso: 150.00,
        fechaInicioCurso: new Date('2025-07-01'),
        fechaFinCurso: new Date('2025-07-30'),
      },
      {
        idCurso: 2,
        nombreCurso: 'Introducción a Python',
        modalidadCurso: 'Presencial',
        valorCurso: 180.00,
        fechaInicioCurso: new Date('2025-08-01'),
        fechaFinCurso: new Date('2025-08-30'),
      },
    ];

    it('debería obtener cursos disponibles (fecha futura)', async () => {
      // Arrange
      mockFindMany.mockResolvedValue(mockCursosDisponibles);

      // Act
      const result = await cursoService.getCursosDisponibles();

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          fechaInicioCurso: {
            gte: expect.any(Date),
          },
        },
        select: {
          idCurso: true,
          nombreCurso: true,
          modalidadCurso: true,
          valorCurso: true,
          fechaInicioCurso: true,
          fechaFinCurso: true,
        },
        orderBy: {
          fechaInicioCurso: 'asc',
        },
      });
      expect(result).toEqual(mockCursosDisponibles);
    });

    it('debería manejar errores al obtener cursos disponibles', async () => {
      // Arrange
      mockFindMany.mockRejectedValue(new Error('Error de base de datos'));

      // Act & Assert
      await expect(cursoService.getCursosDisponibles())
        .rejects
        .toThrow('Error al obtener los cursos disponibles: Error de base de datos');
    });
  });

  describe('deleteCurso', () => {
    const mockCurso = {
      idCurso: 1,
      nombreCortoCurso: 'JS101',
      nombreCurso: 'Introducción a JavaScript',
      modalidadCurso: 'Virtual',
      descripcionCurso: 'Curso básico de JavaScript',
      valorCurso: 150.00,
      fechaInicioCurso: new Date('2025-07-01'),
      fechaFinCurso: new Date('2025-07-30'),
    };

    it('debería eliminar un curso exitosamente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockCurso);
      mockDelete.mockResolvedValue(mockCurso);

      // Act
      const result = await cursoService.deleteCurso(1);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idCurso: 1 },
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { idCurso: 1 },
      });
      expect(mockToCursoResponseDto).toHaveBeenCalledWith(mockCurso);
      expect(result).toEqual(mockCurso);
    });

    it('debería lanzar NotFoundError si el curso no existe', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(cursoService.deleteCurso(999))
        .rejects
        .toThrow(NotFoundError);

      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('debería manejar errores de base de datos al eliminar', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockCurso);
      mockDelete.mockRejectedValue(new Error('Error de base de datos'));

      // Act & Assert
      await expect(cursoService.deleteCurso(1))
        .rejects
        .toThrow('Error al eliminar el curso: Error de base de datos');
    });
  });
});

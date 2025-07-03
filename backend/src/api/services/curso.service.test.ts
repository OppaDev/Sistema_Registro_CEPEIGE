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

import { CursoService } from './curso.service';
import { CreateCursoDto, UpdateCursoDto } from '@/api/dtos/curso.dto';
import { NotFoundError } from '@/utils/errorTypes';
import { Decimal } from '@prisma/client/runtime/library';

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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const createCursoDto: CreateCursoDto = {
      nombreCortoCurso: 'PROG-JS',
      nombreCurso: 'Programación JavaScript Avanzada',
      modalidadCurso: 'virtual',
      descripcionCurso: 'Curso completo de JavaScript moderno',
      valorCurso: new Decimal(250.00),
      fechaInicioCurso: tomorrow.toISOString().split('T')[0],
      fechaFinCurso: nextWeek.toISOString().split('T')[0],
    };

    // SRV-CUR-001: Crear un curso con fechas válidas
    it('SRV-CUR-001: debería crear un curso con fechas válidas', async () => {
      // Arrange
      const prismaCurso = {
        idCurso: 1,
        nombreCortoCurso: createCursoDto.nombreCortoCurso,
        nombreCurso: createCursoDto.nombreCurso,
        modalidadCurso: createCursoDto.modalidadCurso,
        descripcionCurso: createCursoDto.descripcionCurso,
        valorCurso: createCursoDto.valorCurso,
        fechaInicioCurso: new Date(createCursoDto.fechaInicioCurso),
        fechaFinCurso: new Date(createCursoDto.fechaFinCurso),
      };
      const expectedResponseDto = {
        idCurso: 1,
        nombreCortoCurso: createCursoDto.nombreCortoCurso,
        nombreCurso: createCursoDto.nombreCurso,
        modalidadCurso: createCursoDto.modalidadCurso,
        descripcionCurso: createCursoDto.descripcionCurso,
        valorCurso: createCursoDto.valorCurso,
        fechaInicioCurso: createCursoDto.fechaInicioCurso,
        fechaFinCurso: createCursoDto.fechaFinCurso,
      };

      mockCreate.mockResolvedValue(prismaCurso);
      mockToCursoResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await cursoService.createCurso(createCursoDto);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          nombreCortoCurso: createCursoDto.nombreCortoCurso,
          nombreCurso: createCursoDto.nombreCurso,
          modalidadCurso: createCursoDto.modalidadCurso,
          descripcionCurso: createCursoDto.descripcionCurso,
          valorCurso: createCursoDto.valorCurso,
          fechaInicioCurso: expect.any(Date),
          fechaFinCurso: expect.any(Date),
        },
      });
      expect(mockToCursoResponseDto).toHaveBeenCalledWith(prismaCurso);
      expect(result).toEqual(expectedResponseDto);
    });

    // SRV-CUR-002: Falla al crear si la fecha de inicio es anterior a hoy
    it('SRV-CUR-002: debería fallar al crear si la fecha de inicio es anterior a hoy', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5); // 5 días en el pasado para asegurar que es anterior

      const invalidCursoDto: CreateCursoDto = {
        ...createCursoDto,
        fechaInicioCurso: pastDate.toISOString().split('T')[0],
      };

      // Act & Assert
      await expect(cursoService.createCurso(invalidCursoDto))
        .rejects.toThrow('La fecha de inicio debe ser mayor o igual a la fecha actual');
      
      expect(mockCreate).not.toHaveBeenCalled();
    });

    // SRV-CUR-003: Falla al crear si la fecha de inicio es posterior a la de fin
    it('SRV-CUR-003: debería fallar al crear si la fecha de inicio es posterior a la fecha de fin', async () => {
      // Arrange
      const invalidCursoDto: CreateCursoDto = {
        ...createCursoDto,
        fechaInicioCurso: nextWeek.toISOString().split('T')[0], // Fecha posterior
        fechaFinCurso: tomorrow.toISOString().split('T')[0],    // Fecha anterior
      };

      // Act & Assert
      await expect(cursoService.createCurso(invalidCursoDto))
        .rejects.toThrow('La fecha de inicio no puede ser posterior a la fecha de fin');
      
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debería permitir crear un curso que inicia hoy', async () => {
      // Arrange
      const today = new Date();
      const validCursoDto: CreateCursoDto = {
        ...createCursoDto,
        fechaInicioCurso: today.toISOString().split('T')[0],
      };

      const prismaCurso = {
        idCurso: 1,
        nombreCortoCurso: validCursoDto.nombreCortoCurso,
        nombreCurso: validCursoDto.nombreCurso,
        modalidadCurso: validCursoDto.modalidadCurso,
        descripcionCurso: validCursoDto.descripcionCurso,
        valorCurso: validCursoDto.valorCurso,
        fechaInicioCurso: today,
        fechaFinCurso: new Date(validCursoDto.fechaFinCurso),
      };

      mockCreate.mockResolvedValue(prismaCurso);
      mockToCursoResponseDto.mockReturnValue(prismaCurso);

      // Act
      const result = await cursoService.createCurso(validCursoDto);

      // Assert
      expect(mockCreate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('updateCurso', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const existingCurso = {
      idCurso: 1,
      nombreCortoCurso: 'PROG-PY',
      nombreCurso: 'Programación Python',
      modalidadCurso: 'presencial',
      descripcionCurso: 'Curso básico de Python',
      valorCurso: new Decimal(200.00),
      fechaInicioCurso: tomorrow.toISOString().split('T')[0],
      fechaFinCurso: nextWeek.toISOString().split('T')[0],
    };

    const updateCursoDto: UpdateCursoDto = {
      valorCurso: new Decimal(150.00),
    };

    // SRV-CUR-004: Actualizar un curso existente
    it('SRV-CUR-004: debería actualizar un curso existente', async () => {
      // Arrange
      const updatedCurso = {
        ...existingCurso,
        valorCurso: updateCursoDto.valorCurso,
        fechaInicioCurso: new Date(existingCurso.fechaInicioCurso),
        fechaFinCurso: new Date(existingCurso.fechaFinCurso),
      };
      const expectedResponseDto = {
        ...existingCurso,
        valorCurso: updateCursoDto.valorCurso,
      };

      mockFindUnique.mockResolvedValue(updatedCurso);
      mockUpdate.mockResolvedValue(updatedCurso);
      mockToCursoResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await cursoService.updateCurso(1, updateCursoDto);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idCurso: 1 },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        data: updateCursoDto,
      });
      expect(mockToCursoResponseDto).toHaveBeenCalledWith(updatedCurso);
      expect(result).toEqual(expectedResponseDto);
    });

    // SRV-CUR-005: Fallar al actualizar un curso inexistente
    it('SRV-CUR-005: debería fallar al actualizar un curso inexistente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(cursoService.updateCurso(999, updateCursoDto))
        .rejects.toThrow(NotFoundError);
      
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debería fallar con fecha de inicio en el pasado', async () => {
      // Arrange
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const invalidUpdateDto: UpdateCursoDto = {
        fechaInicioCurso: yesterday.toISOString().split('T')[0],
      };

      mockFindUnique.mockResolvedValue(existingCurso);

      // Act & Assert
      await expect(cursoService.updateCurso(1, invalidUpdateDto))
        .rejects.toThrow('La fecha de inicio debe ser mayor o igual a la fecha actual');
      
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debería fallar si la fecha de inicio es posterior a la de fin', async () => {
      // Arrange
      const invalidUpdateDto: UpdateCursoDto = {
        fechaInicioCurso: nextWeek.toISOString().split('T')[0],
        fechaFinCurso: tomorrow.toISOString().split('T')[0],
      };

      mockFindUnique.mockResolvedValue(existingCurso);

      // Act & Assert
      await expect(cursoService.updateCurso(1, invalidUpdateDto))
        .rejects.toThrow('La fecha de inicio no puede ser posterior a la fecha de fin');
      
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('getAllCursos', () => {
    const options = {
      page: 1,
      limit: 10,
      orderBy: 'nombreCurso',
      order: 'asc' as const,
    };

    const mockCursos = [
      {
        idCurso: 1,
        nombreCortoCurso: 'PROG-JS',
        nombreCurso: 'JavaScript',
        modalidadCurso: 'virtual',
        descripcionCurso: 'Curso de JavaScript',
        valorCurso: new Decimal(250.00),
        fechaInicioCurso: new Date('2024-01-15'),
        fechaFinCurso: new Date('2024-02-15'),
      },
      {
        idCurso: 2,
        nombreCortoCurso: 'PROG-PY',
        nombreCurso: 'Python',
        modalidadCurso: 'presencial',
        descripcionCurso: 'Curso de Python',
        valorCurso: new Decimal(300.00),
        fechaInicioCurso: new Date('2024-02-01'),
        fechaFinCurso: new Date('2024-03-01'),
      },
    ];

    // SRV-CUR-006: Obtener todos los cursos con paginación
    it('SRV-CUR-006: debería obtener todos los cursos con paginación', async () => {
      // Arrange
      mockFindMany.mockResolvedValue(mockCursos);
      mockCount.mockResolvedValue(2);
      mockToCursoResponseDto.mockImplementation((curso) => ({
        ...curso,
        valorCurso: true,
      }));

      // Act
      const result = await cursoService.getAllCursos(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { nombreCurso: 'asc' },
      });
      expect(mockCount).toHaveBeenCalled();
      expect(result.cursos).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    // SRV-CUR-007: Obtener cursos con página 2
    it('SRV-CUR-007: debería obtener cursos de la página 2', async () => {
      // Arrange
      const optionsPage2 = { ...options, page: 2 };
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(2);

      // Act
      await cursoService.getAllCursos(optionsPage2);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: { nombreCurso: 'asc' },
      });
    });

    // SRV-CUR-008: Manejar error de base de datos
    it('SRV-CUR-008: debería manejar errores de base de datos', async () => {
      // Arrange
      mockFindMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(cursoService.getAllCursos(options))
        .rejects.toThrow('Error al obtener los cursos: Database error');
    });
  });

  describe('getCursoById', () => {
    const mockCurso = {
      idCurso: 1,
      nombreCortoCurso: 'PROG-JS',
      nombreCurso: 'JavaScript',
      modalidadCurso: 'virtual',
      descripcionCurso: 'Curso de JavaScript',
      valorCurso: new Decimal(250.00),
      fechaInicioCurso: new Date('2024-01-15'),
      fechaFinCurso: new Date('2024-02-15'),
    };

    // SRV-CUR-009: Obtener un curso por ID
    it('SRV-CUR-009: debería obtener un curso por ID', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockCurso);
      mockToCursoResponseDto.mockReturnValue(mockCurso);

      // Act
      const result = await cursoService.getCursoById(1);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idCurso: 1 },
      });
      expect(mockToCursoResponseDto).toHaveBeenCalledWith(mockCurso);
      expect(result).toEqual(mockCurso);
    });

    // SRV-CUR-010: Fallar al obtener un curso inexistente
    it('SRV-CUR-010: debería fallar al obtener un curso inexistente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(cursoService.getCursoById(999))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCurso', () => {
    const mockCurso = {
      idCurso: 1,
      nombreCortoCurso: 'PROG-JS',
      nombreCurso: 'JavaScript',
      modalidadCurso: 'virtual',
      descripcionCurso: 'Curso de JavaScript',
      valorCurso: new Decimal(250.00),
      fechaInicioCurso: new Date('2024-01-15'),
      fechaFinCurso: new Date('2024-02-15'),
    };

    // SRV-CUR-011: Eliminar un curso existente
    it('SRV-CUR-011: debería eliminar un curso existente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockCurso);
      mockDelete.mockResolvedValue(mockCurso);
      mockToCursoResponseDto.mockReturnValue(mockCurso);

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

    // SRV-CUR-012: Fallar al eliminar un curso inexistente
    it('SRV-CUR-012: debería fallar al eliminar un curso inexistente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(cursoService.deleteCurso(999))
        .rejects.toThrow(NotFoundError);
      
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('getCursosDisponibles', () => {
    const mockCursos = [
      {
        idCurso: 1,
        nombreCortoCurso: 'PROG-JS',
        nombreCurso: 'JavaScript',
        modalidadCurso: 'virtual',
        descripcionCurso: 'Curso de JavaScript',
        valorCurso: new Decimal(250.00),
        fechaInicioCurso: new Date('2024-01-15'),
        fechaFinCurso: new Date('2024-02-15'),
      },
    ];

    // SRV-CUR-013: Obtener cursos disponibles
    it('SRV-CUR-013: debería obtener cursos disponibles', async () => {
      // Arrange
      mockFindMany.mockResolvedValue(mockCursos);
      mockToCursoResponseDto.mockImplementation((curso) => ({
        idCurso: curso.idCurso,
        nombreCortoCurso: curso.nombreCortoCurso,
        nombreCurso: curso.nombreCurso,
        modalidadCurso: curso.modalidadCurso,
        valorCurso: curso.valorCurso,
        fechaInicioCurso: curso.fechaInicioCurso,
        fechaFinCurso: curso.fechaFinCurso,
      }));

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
      expect(result).toHaveLength(1);
      expect(result[0].idCurso).toBe(1);
    });
  });
});

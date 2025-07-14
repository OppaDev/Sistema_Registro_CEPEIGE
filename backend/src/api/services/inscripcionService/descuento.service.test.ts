// Mock del módulo Prisma
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    descuento: {
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
const mockToDescuentoResponseDto = jest.fn();
jest.mock('@/api/services/mappers/inscripcionMapper/descuento.mapper', () => ({
  toDescuentoResponseDto: mockToDescuentoResponseDto,
}));

import { DescuentoService } from './descuento.service';
import { CreateDescuentoDto, UpdateDescuentoDto } from '@/api/dtos/inscripcionDto/descuento.dto';
import { NotFoundError, AppError } from '@/utils/errorTypes';
import { Decimal } from '@prisma/client/runtime/library';

describe('DescuentoService', () => {
  let descuentoService: DescuentoService;

  beforeEach(() => {
    descuentoService = new DescuentoService();
    jest.clearAllMocks();
    
    // Mock por defecto del mapper
    mockToDescuentoResponseDto.mockImplementation((descuento) => ({
      idDescuento: descuento.idDescuento,
      tipoDescuento: descuento.tipoDescuento,
      valorDescuento: descuento.valorDescuento,
      porcentajeDescuento: descuento.porcentajeDescuento,
      descripcionDescuento: descuento.descripcionDescuento,
    }));
  });

  describe('createDescuento', () => {
    const createDescuentoDto: CreateDescuentoDto = {
      tipoDescuento: 'porcentual',
      valorDescuento: new Decimal(0),
      porcentajeDescuento: new Decimal(10),
      descripcionDescuento: 'Descuento para estudiantes',
    };

    // SRV-DSC-001: Crear un descuento exitosamente
    it('SRV-DSC-001: debería crear un descuento exitosamente', async () => {
      // Arrange
      const prismaDescuento = {
        idDescuento: 1,
        ...createDescuentoDto,
      };
      const expectedResponseDto = {
        idDescuento: 1,
        ...createDescuentoDto,
      };

      mockCreate.mockResolvedValue(prismaDescuento);
      mockToDescuentoResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await descuentoService.createDescuento(createDescuentoDto);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          tipoDescuento: createDescuentoDto.tipoDescuento,
          valorDescuento: createDescuentoDto.valorDescuento,
          porcentajeDescuento: createDescuentoDto.porcentajeDescuento,
          descripcionDescuento: createDescuentoDto.descripcionDescuento,
        },
      });
      expect(mockToDescuentoResponseDto).toHaveBeenCalledWith(prismaDescuento);
      expect(result).toEqual(expectedResponseDto);
    });

    it('debería manejar errores durante la creación', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockCreate.mockRejectedValue(dbError);

      // Act & Assert
      await expect(descuentoService.createDescuento(createDescuentoDto))
        .rejects.toThrow(AppError);
      await expect(descuentoService.createDescuento(createDescuentoDto))
        .rejects.toThrow('Error al crear el descuento: Database connection failed');
    });

    it('debería manejar errores desconocidos durante la creación', async () => {
      // Arrange
      const unknownError = 'Unknown error';
      mockCreate.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(descuentoService.createDescuento(createDescuentoDto))
        .rejects.toThrow(AppError);
      await expect(descuentoService.createDescuento(createDescuentoDto))
        .rejects.toThrow('Error desconocido al crear el descuento');
    });
  });

  describe('getDescuentoById', () => {
    // SRV-DSC-002: Obtener un descuento por un ID existente
    it('SRV-DSC-002: debería obtener un descuento por un ID existente', async () => {
      // Arrange
      const id = 1;
      const prismaDescuento = {
        idDescuento: id,
        tipoDescuento: 'porcentual',
        valorDescuento: new Decimal(0),
        porcentajeDescuento: new Decimal(15),
        descripcionDescuento: 'Descuento especial',
      };

      mockFindUnique.mockResolvedValue(prismaDescuento);

      // Act
      const result = await descuentoService.getDescuentoById(id);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idDescuento: id },
      });
      expect(mockToDescuentoResponseDto).toHaveBeenCalledWith(prismaDescuento);
      expect(result).toBeDefined();
    });

    it('debería fallar si el descuento no existe', async () => {
      // Arrange
      const id = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(descuentoService.getDescuentoById(id))
        .rejects.toThrow(NotFoundError);
      await expect(descuentoService.getDescuentoById(id))
        .rejects.toThrow('Descuento');
    });

    it('debería manejar errores durante la búsqueda', async () => {
      // Arrange
      const id = 1;
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(descuentoService.getDescuentoById(id))
        .rejects.toThrow(AppError);
    });
  });

  describe('updateDescuento', () => {
    const updateDescuentoDto: UpdateDescuentoDto = {
      porcentajeDescuento: new Decimal(20),
      descripcionDescuento: 'Descuento actualizado',
    };

    // SRV-DSC-003: Actualizar un descuento existente
    it('SRV-DSC-003: debería actualizar un descuento existente', async () => {
      // Arrange
      const id = 1;
      const existingDescuento = {
        idDescuento: id,
        tipoDescuento: 'porcentual',
        valorDescuento: new Decimal(0),
        porcentajeDescuento: new Decimal(10),
        descripcionDescuento: 'Descuento original',
      };
      const updatedDescuento = {
        ...existingDescuento,
        ...updateDescuentoDto,
      };

      mockFindUnique.mockResolvedValue(existingDescuento);
      mockUpdate.mockResolvedValue(updatedDescuento);

      // Act
      const result = await descuentoService.updateDescuento(id, updateDescuentoDto);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idDescuento: id },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { idDescuento: id },
        data: updateDescuentoDto,
      });
      expect(mockToDescuentoResponseDto).toHaveBeenCalledWith(updatedDescuento);
      expect(result).toBeDefined();
    });

    it('debería fallar al actualizar si el descuento no existe', async () => {
      // Arrange
      const id = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(descuentoService.updateDescuento(id, updateDescuentoDto))
        .rejects.toThrow(NotFoundError);
      
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debería manejar errores durante la actualización', async () => {
      // Arrange
      const id = 1;
      const existingDescuento = {
        idDescuento: id,
        tipoDescuento: 'porcentual',
        valorDescuento: new Decimal(0),
        porcentajeDescuento: new Decimal(10),
        descripcionDescuento: 'Descuento original',
      };
      const dbError = new Error('Database connection failed');

      mockFindUnique.mockResolvedValue(existingDescuento);
      mockUpdate.mockRejectedValue(dbError);

      // Act & Assert
      await expect(descuentoService.updateDescuento(id, updateDescuentoDto))
        .rejects.toThrow(AppError);
    });
  });

  describe('deleteDescuento', () => {
    // SRV-DSC-004: Eliminar un descuento no utilizado
    it('SRV-DSC-004: debería eliminar un descuento no utilizado', async () => {
      // Arrange
      const id = 1;
      const descuentoSinInscripciones = {
        idDescuento: id,
        tipoDescuento: 'porcentual',
        valorDescuento: new Decimal(0),
        porcentajeDescuento: new Decimal(10),
        descripcionDescuento: 'Descuento sin uso',
        inscripciones: [], // Sin inscripciones asociadas
      };

      mockFindUnique.mockResolvedValue(descuentoSinInscripciones);
      mockDelete.mockResolvedValue(descuentoSinInscripciones);

      // Act
      const result = await descuentoService.deleteDescuento(id);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idDescuento: id },
        include: { inscripciones: true },
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { idDescuento: id },
      });
      expect(mockToDescuentoResponseDto).toHaveBeenCalledWith(descuentoSinInscripciones);
      expect(result).toBeDefined();
    });

    // SRV-DSC-005: Falla al eliminar un descuento asociado a inscripciones
    it('SRV-DSC-005: debería fallar al eliminar un descuento asociado a inscripciones', async () => {
      // Arrange
      const id = 1;
      const descuentoConInscripciones = {
        idDescuento: id,
        tipoDescuento: 'porcentual',
        valorDescuento: new Decimal(0),
        porcentajeDescuento: new Decimal(10),
        descripcionDescuento: 'Descuento en uso',
        inscripciones: [
          { idInscripcion: 1, idPersona: 1, idCurso: 1 },
          { idInscripcion: 2, idPersona: 2, idCurso: 1 },
        ],
      };

      mockFindUnique.mockResolvedValue(descuentoConInscripciones);

      // Act & Assert
      await expect(descuentoService.deleteDescuento(id))
        .rejects.toThrow(AppError);
      await expect(descuentoService.deleteDescuento(id))
        .rejects.toThrow('El descuento con ID 1 no puede ser eliminado porque está asociado a una o más inscripciones.');
      
      expect(mockDelete).not.toHaveBeenCalled();
    });

    // SRV-DSC-006: Falla al eliminar si el ID no existe
    it('SRV-DSC-006: debería fallar al eliminar si el ID no existe', async () => {
      // Arrange
      const id = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(descuentoService.deleteDescuento(id))
        .rejects.toThrow(NotFoundError);
      await expect(descuentoService.deleteDescuento(id))
        .rejects.toThrow('Descuento');
      
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('debería manejar errores durante la eliminación', async () => {
      // Arrange
      const id = 1;
      const descuentoSinInscripciones = {
        idDescuento: id,
        tipoDescuento: 'porcentual',
        valorDescuento: new Decimal(0),
        porcentajeDescuento: new Decimal(10),
        descripcionDescuento: 'Descuento sin uso',
        inscripciones: [],
      };
      const dbError = new Error('Database connection failed');

      mockFindUnique.mockResolvedValue(descuentoSinInscripciones);
      mockDelete.mockRejectedValue(dbError);

      // Act & Assert
      await expect(descuentoService.deleteDescuento(id))
        .rejects.toThrow(AppError);
    });
  });

  describe('getAllDescuentos', () => {
    it('debería obtener una lista paginada de descuentos', async () => {
      // Arrange
      const options = { page: 1, limit: 10, orderBy: 'tipoDescuento', order: 'asc' as const };
      const descuentos = [
        {
          idDescuento: 1,
          tipoDescuento: 'porcentual',
          valorDescuento: new Decimal(0),
          porcentajeDescuento: new Decimal(10),
          descripcionDescuento: 'Descuento estudiantes',
        },
        {
          idDescuento: 2,
          tipoDescuento: 'fijo',
          valorDescuento: new Decimal(50),
          porcentajeDescuento: new Decimal(0),
          descripcionDescuento: 'Descuento empleados',
        }
      ];
      const totalCount = 2;

      mockFindMany.mockResolvedValue(descuentos);
      mockCount.mockResolvedValue(totalCount);

      // Act
      const result = await descuentoService.getAllDescuentos(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { tipoDescuento: 'asc' },
      });
      expect(mockCount).toHaveBeenCalled();
      expect(result).toEqual({
        descuentos: expect.any(Array),
        total: totalCount
      });
      expect(result.descuentos).toHaveLength(2);
    });

    it('debería calcular correctamente el offset para la paginación', async () => {
      // Arrange
      const options = { page: 3, limit: 5, orderBy: 'descripcionDescuento', order: 'desc' as const };
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await descuentoService.getAllDescuentos(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 10, // (3-1) * 5 = 10
        take: 5,
        orderBy: { descripcionDescuento: 'desc' },
      });
    });

    it('debería manejar errores durante la obtención de descuentos', async () => {
      // Arrange
      const options = { page: 1, limit: 10, orderBy: 'tipoDescuento', order: 'asc' as const };
      const dbError = new Error('Database connection failed');
      mockFindMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(descuentoService.getAllDescuentos(options))
        .rejects.toThrow(AppError);
    });
  });
});

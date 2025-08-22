// Mock del módulo Prisma
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    datosFacturacion: {
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
const mockToDatosFacturacionResponseDto = jest.fn();
jest.mock('@/api/services/mappers/inscripcionMapper/datosFacturacion.mapper', () => ({
  toDatosFacturacionResponseDto: mockToDatosFacturacionResponseDto,
}));

import { DatosFacturacionService } from './datosFacturacion.service';
import { CreateDatosFacturacionDto, UpdateDatosFacturacionDto } from '@/api/dtos/inscripcionDto/datosFacturacion.dto';
import { NotFoundError, ConflictError } from '@/utils/errorTypes';

describe('3.1. DatosFacturacionService', () => {
  let datosFacturacionService: DatosFacturacionService;

  beforeEach(() => {
    datosFacturacionService = new DatosFacturacionService();
    jest.clearAllMocks();
    
    // Mock por defecto del mapper
    mockToDatosFacturacionResponseDto.mockImplementation((datos) => ({
      idFacturacion: datos.idFacturacion,
      razonSocial: datos.razonSocial,
      identificacionTributaria: datos.identificacionTributaria,
      telefono: datos.telefono,
      correoFactura: datos.correoFactura,
      direccion: datos.direccion,
    }));
  });

  describe('createDatosFacturacion', () => {
    it('SRV-DFAC-001: debería crear datos de facturación válidos', async () => {
      // Arrange
      const createDatosFacturacionDto: CreateDatosFacturacionDto = {
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123'
      };

      const mockDatosFacturacion = {
        idFacturacion: 1,
        ...createDatosFacturacionDto,
        fechaCreacion: new Date('2025-06-30T12:00:00Z'),
      };

      const expectedResponseDto = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123'
      };

      mockCreate.mockResolvedValue(mockDatosFacturacion);
      mockToDatosFacturacionResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await datosFacturacionService.createDatosFacturacion(createDatosFacturacionDto);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          razonSocial: createDatosFacturacionDto.razonSocial,
          identificacionTributaria: createDatosFacturacionDto.identificacionTributaria,
          telefono: createDatosFacturacionDto.telefono,
          correoFactura: createDatosFacturacionDto.correoFactura,
          direccion: createDatosFacturacionDto.direccion,
        }),
      });
      expect(mockToDatosFacturacionResponseDto).toHaveBeenCalledWith(mockDatosFacturacion);
      expect(result).toEqual(expectedResponseDto);
    });

    it('debería manejar errores durante la creación', async () => {
      // Arrange
      const createDatosFacturacionDto: CreateDatosFacturacionDto = {
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123'
      };

      const dbError = new Error('Database connection failed');
      mockCreate.mockRejectedValue(dbError);

      // Act & Assert
      try {
        await datosFacturacionService.createDatosFacturacion(createDatosFacturacionDto);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Error al crear los datos de facturación');
      }
    });

    it('SRV-DFAC-002: debería lanzar ConflictError cuando la identificación tributaria ya existe', async () => {
      // Arrange
      const createDatosFacturacionDto: CreateDatosFacturacionDto = {
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123'
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['identificacion_tributaria'] }
      };
      mockCreate.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(datosFacturacionService.createDatosFacturacion(createDatosFacturacionDto))
        .rejects.toThrow(ConflictError);
      await expect(datosFacturacionService.createDatosFacturacion(createDatosFacturacionDto))
        .rejects.toThrow('La identificación tributaria ya está registrada');
    });


    it('SRV-DFAC-002c: debería lanzar ConflictError genérico para otros campos únicos', async () => {
      // Arrange
      const createDatosFacturacionDto: CreateDatosFacturacionDto = {
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123'
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['otro_campo'] }
      };
      mockCreate.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(datosFacturacionService.createDatosFacturacion(createDatosFacturacionDto))
        .rejects.toThrow(ConflictError);
      await expect(datosFacturacionService.createDatosFacturacion(createDatosFacturacionDto))
        .rejects.toThrow('Ya existe un registro con estos datos únicos');
    });

    it('SRV-DFAC-002d: debería lanzar error genérico para errores desconocidos', async () => {
      // Arrange
      const createDatosFacturacionDto: CreateDatosFacturacionDto = {
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123'
      };

      const unknownError = { message: 'Unknown error', code: 'UNKNOWN' };
      mockCreate.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(datosFacturacionService.createDatosFacturacion(createDatosFacturacionDto))
        .rejects.toThrow('Error desconocido al crear los datos de facturación');
    });
  });

  describe('updateDatosFacturacion', () => {
    it('SRV-DFAC-003: debería actualizar datos de facturación existentes', async () => {
      // Arrange
      const idFacturacion = 1;
      const updateDatosFacturacionDto: UpdateDatosFacturacionDto = {
        razonSocial: 'Empresa Test Actualizada S.A.',
        correoFactura: 'updated@example.com',
      };

      const mockExistingDatos = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123',
        fechaCreacion: new Date('2025-06-30T12:00:00Z'),
      };

      const mockUpdatedDatos = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test Actualizada S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'updated@example.com',
        direccion: 'Av. Principal 123',
        fechaCreacion: new Date('2025-06-30T12:00:00Z'),
      };

      const expectedResponseDto = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test Actualizada S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'updated@example.com',
        direccion: 'Av. Principal 123',
      };

      mockFindUnique.mockResolvedValue(mockExistingDatos);
      mockUpdate.mockResolvedValue(mockUpdatedDatos);
      mockToDatosFacturacionResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await datosFacturacionService.updateDatosFacturacion(idFacturacion, updateDatosFacturacionDto);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idFacturacion },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { idFacturacion },
        data: updateDatosFacturacionDto,
      });
      expect(mockToDatosFacturacionResponseDto).toHaveBeenCalledWith(mockUpdatedDatos);
      expect(result).toEqual(expectedResponseDto);
    });

    it('SRV-DFAC-004: debería lanzar NotFoundError cuando los datos no existen', async () => {
      // Arrange
      const idFacturacion = 999;
      const updateDatosFacturacionDto: UpdateDatosFacturacionDto = {
        razonSocial: 'Empresa Test Actualizada S.A.',
      };

      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(datosFacturacionService.updateDatosFacturacion(idFacturacion, updateDatosFacturacionDto))
        .rejects.toThrow(NotFoundError);
      
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idFacturacion },
      });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('SRV-DFAC-004b: debería lanzar ConflictError cuando hay conflicto de identificación tributaria en actualización', async () => {
      // Arrange
      const idFacturacion = 1;
      const updateDatosFacturacionDto: UpdateDatosFacturacionDto = {
        identificacionTributaria: '0402084040',
      };

      const mockExistingDatos = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084041',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123',
        fechaCreacion: new Date('2025-06-30T12:00:00Z'),
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['identificacion_tributaria'] }
      };

      mockFindUnique.mockResolvedValue(mockExistingDatos);
      mockUpdate.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(datosFacturacionService.updateDatosFacturacion(idFacturacion, updateDatosFacturacionDto))
        .rejects.toThrow(ConflictError);
      await expect(datosFacturacionService.updateDatosFacturacion(idFacturacion, updateDatosFacturacionDto))
        .rejects.toThrow('La identificación tributaria ya está registrada');
    });

    it('SRV-DFAC-004c: debería manejar errores genéricos en actualización', async () => {
      // Arrange
      const idFacturacion = 1;
      const updateDatosFacturacionDto: UpdateDatosFacturacionDto = {
        razonSocial: 'Empresa Test Actualizada S.A.',
      };

      const mockExistingDatos = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123',
        fechaCreacion: new Date('2025-06-30T12:00:00Z'),
      };

      const unknownError = { message: 'Database error', code: 'DB_ERROR' };

      mockFindUnique.mockResolvedValue(mockExistingDatos);
      mockUpdate.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(datosFacturacionService.updateDatosFacturacion(idFacturacion, updateDatosFacturacionDto))
        .rejects.toThrow('Error desconocido al actualizar los datos de facturación');
    });
  });

  describe('getDatosFacturacionById', () => {
    it('SRV-DFAC-005: debería obtener datos de facturación por ID', async () => {
      // Arrange
      const idFacturacion = 1;
      const mockDatosFacturacion = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123',
        fechaCreacion: new Date('2025-06-30T12:00:00Z'),
      };

      const expectedResponseDto = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123',
      };

      mockFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockToDatosFacturacionResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await datosFacturacionService.getDatosFacturacionById(idFacturacion);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idFacturacion },
      });
      expect(mockToDatosFacturacionResponseDto).toHaveBeenCalledWith(mockDatosFacturacion);
      expect(result).toEqual(expectedResponseDto);
    });

    it('SRV-DFAC-006: debería lanzar NotFoundError cuando los datos no existen', async () => {
      // Arrange
      const idFacturacion = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(datosFacturacionService.getDatosFacturacionById(idFacturacion))
        .rejects.toThrow(NotFoundError);
      
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idFacturacion },
      });
    });

    it('SRV-DFAC-006b: debería manejar errores genéricos al obtener por ID', async () => {
      // Arrange
      const idFacturacion = 1;
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(datosFacturacionService.getDatosFacturacionById(idFacturacion))
        .rejects.toThrow('Error al obtener los datos de facturación: Database connection failed');
    });

    it('SRV-DFAC-006c: debería manejar errores desconocidos al obtener por ID', async () => {
      // Arrange
      const idFacturacion = 1;
      const unknownError = { message: 'Unknown error', code: 'UNKNOWN' };
      mockFindUnique.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(datosFacturacionService.getDatosFacturacionById(idFacturacion))
        .rejects.toThrow('Error desconocido al obtener los datos de facturación');
    });
  });

  describe('deleteDatosFacturacion', () => {
    it('SRV-DFAC-007: debería eliminar datos de facturación existentes', async () => {
      // Arrange
      const idFacturacion = 1;
      const mockDatosFacturacion = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123',
        fechaCreacion: new Date('2025-06-30T12:00:00Z'),
      };

      const expectedResponseDto = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123',
      };

      mockFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockDelete.mockResolvedValue(mockDatosFacturacion);
      mockToDatosFacturacionResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await datosFacturacionService.deleteDatosFacturacion(idFacturacion);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idFacturacion },
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { idFacturacion },
      });
      expect(mockToDatosFacturacionResponseDto).toHaveBeenCalledWith(mockDatosFacturacion);
      expect(result).toEqual(expectedResponseDto);
    });

    it('SRV-DFAC-008: debería lanzar NotFoundError cuando los datos no existen', async () => {
      // Arrange
      const idFacturacion = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(datosFacturacionService.deleteDatosFacturacion(idFacturacion))
        .rejects.toThrow(NotFoundError);
      
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idFacturacion },
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('SRV-DFAC-008b: debería manejar errores genéricos durante la eliminación', async () => {
      // Arrange
      const idFacturacion = 1;
      const mockDatosFacturacion = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123',
        fechaCreacion: new Date('2025-06-30T12:00:00Z'),
      };

      const dbError = new Error('Database constraint violation');
      mockFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockDelete.mockRejectedValue(dbError);

      // Act & Assert
      await expect(datosFacturacionService.deleteDatosFacturacion(idFacturacion))
        .rejects.toThrow('Error al eliminar los datos de facturación: Database constraint violation');
    });

    it('SRV-DFAC-008c: debería manejar errores desconocidos durante la eliminación', async () => {
      // Arrange
      const idFacturacion = 1;
      const mockDatosFacturacion = {
        idFacturacion: 1,
        razonSocial: 'Empresa Test S.A.',
        identificacionTributaria: '0402084040',
        telefono: '+593987654321',
        correoFactura: 'test@example.com',
        direccion: 'Av. Principal 123',
        fechaCreacion: new Date('2025-06-30T12:00:00Z'),
      };

      const unknownError = { message: 'Unknown error', code: 'UNKNOWN' };
      mockFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockDelete.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(datosFacturacionService.deleteDatosFacturacion(idFacturacion))
        .rejects.toThrow('Error desconocido al eliminar los datos de facturación');
    });
  });

  describe('getAllDatosFacturacion', () => {
    it('SRV-DFAC-009: debería obtener todos los datos de facturación con paginación', async () => {
      // Arrange
      const options = { page: 1, limit: 10, order: 'desc' as const };
      const mockDatosFacturacion = [
        {
          idFacturacion: 1,
          cedulaRuc: '0402084040',
          nombreComercial: 'Empresa Test 1',
          tipoIdentificacion: 'cedula',
          razonSocial: 'Empresa Test 1 S.A.',
          email: 'test1@example.com',
          telefono: '+593987654321',
          direccion: 'Av. Principal 123',
          fechaCreacion: new Date('2025-06-30T12:00:00Z'),
        },
        {
          idFacturacion: 2,
          cedulaRuc: '0402084041',
          nombreComercial: 'Empresa Test 2',
          tipoIdentificacion: 'cedula',
          razonSocial: 'Empresa Test 2 S.A.',
          email: 'test2@example.com',
          telefono: '+593987654322',
          direccion: 'Av. Secundaria 456',
          fechaCreacion: new Date('2025-06-30T13:00:00Z'),
        }
      ];
      const totalCount = 2;

      mockFindMany.mockResolvedValue(mockDatosFacturacion);
      mockCount.mockResolvedValue(totalCount);

      // Act
      const result = await datosFacturacionService.getAllDatosFacturacion(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { razonSocial: 'desc' },
      });
      expect(mockCount).toHaveBeenCalled();
      expect(result).toEqual({
        datosFacturacion: expect.any(Array),
        total: totalCount
      });
      expect(result.datosFacturacion).toHaveLength(2);
    });

    it('debería calcular correctamente el offset para la paginación', async () => {
      // Arrange
      const options = { page: 3, limit: 5, order: 'desc' as const };
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await datosFacturacionService.getAllDatosFacturacion(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 10, // (3-1) * 5 = 10
        take: 5,
        orderBy: { razonSocial: 'desc' },
      });
    });

    it('SRV-DFAC-010: debería manejar errores genéricos al obtener todos los datos', async () => {
      // Arrange
      const options = { page: 1, limit: 10, order: 'desc' as const };
      const dbError = new Error('Database timeout');
      
      mockFindMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(datosFacturacionService.getAllDatosFacturacion(options))
        .rejects.toThrow('Error al obtener los datos de facturación: Database timeout');
    });

    it('SRV-DFAC-011: debería manejar errores desconocidos al obtener todos los datos', async () => {
      // Arrange
      const options = { page: 1, limit: 10, order: 'desc' as const };
      const unknownError = { message: 'Unknown error', code: 'UNKNOWN' };
      
      mockFindMany.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(datosFacturacionService.getAllDatosFacturacion(options))
        .rejects.toThrow('Error desconocido al obtener los datos de facturación');
    });
  });
});

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
jest.mock('@/api/services/mappers/datosFacturacion.mapper', () => ({
  toDatosFacturacionResponseDto: mockToDatosFacturacionResponseDto,
}));

import { DatosFacturacionService } from './datosFacturacion.service';
import { CreateDatosFacturacionDto, UpdateDatosFacturacionDto } from '@/api/dtos/datosFacturacion.dto';
import { NotFoundError } from '@/utils/errorTypes';

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
  });
});

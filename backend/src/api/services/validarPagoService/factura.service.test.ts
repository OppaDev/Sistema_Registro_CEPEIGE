// Mock del módulo Prisma
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();

// Mocks separados para inscripcion y datosFacturacion
const mockInscripcionFindUnique = jest.fn();
const mockDatosFacturacionFindUnique = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    factura: {
      create: mockCreate,
      update: mockUpdate,
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      delete: mockDelete,
      count: mockCount,
    },
    inscripcion: {
      findUnique: mockInscripcionFindUnique,
    },
    datosFacturacion: {
      findUnique: mockDatosFacturacionFindUnique,
    },
  })),
}));

// Mock de los mappers
const mockToFacturaResponseDto = jest.fn();
const mockToFacturaWithRelationsResponseDto = jest.fn();
jest.mock('@/api/services/mappers/validarPagoMapper/factura.mapper', () => ({
  toFacturaResponseDto: mockToFacturaResponseDto,
  toFacturaWithRelationsResponseDto: mockToFacturaWithRelationsResponseDto,
}));

import { FacturaService } from '@/api/services/validarPagoService/factura.service';
import { CreateFacturaDto } from '@/api/dtos/validarPagoDto/factura.dto';
import { NotFoundError, ConflictError } from '@/utils/errorTypes';
import { Decimal } from '@prisma/client/runtime/library';

describe('FacturaService', () => {
  let facturaService: FacturaService;

  beforeEach(() => {
    facturaService = new FacturaService();
    jest.clearAllMocks();
    
    // Resetear todos los mocks
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockFindMany.mockReset();
    mockFindUnique.mockReset();
    mockFindFirst.mockReset();
    mockDelete.mockReset();
    mockCount.mockReset();
    mockInscripcionFindUnique.mockReset();
    mockDatosFacturacionFindUnique.mockReset();
    
    // Mock por defecto de los mappers
    mockToFacturaResponseDto.mockImplementation((factura) => ({
      idFactura: factura.idFactura,
      idInscripcion: factura.idInscripcion,
      idFacturacion: factura.idFacturacion,
      valorPagado: factura.valorPagado,
      verificacionPago: factura.verificacionPago,
      numeroIngreso: factura.numeroIngreso,
      numeroFactura: factura.numeroFactura,
    }));

    mockToFacturaWithRelationsResponseDto.mockImplementation((factura) => ({
      idFactura: factura.idFactura,
      idInscripcion: factura.idInscripcion,
      idFacturacion: factura.idFacturacion,
      valorPagado: factura.valorPagado,
      verificacionPago: factura.verificacionPago,
      numeroIngreso: factura.numeroIngreso,
      numeroFactura: factura.numeroFactura,
      inscripcion: factura.inscripcion,
    }));
  });

  describe('createFactura', () => {
    const createFacturaDto: CreateFacturaDto = {
      idInscripcion: 1,
      idFacturacion: 1,
      valorPagado: new Decimal(150.00),
      numeroIngreso: 'ING-2025-001',
      numeroFactura: 'FAC-2025-001',
    };

    it('SRV-FAC-001: debería crear una factura exitosamente', async () => {
      // Arrange
      const prismaFactura = {
        idFactura: 1,
        idInscripcion: 1,
        idFacturacion: 1,
        valorPagado: new Decimal(150.00),
        verificacionPago: false,
        numeroIngreso: 'ING-2025-001',
        numeroFactura: 'FAC-2025-001',
      };

      const expectedResponseDto = {
        idFactura: 1,
        idInscripcion: 1,
        idFacturacion: 1,
        valorPagado: new Decimal(150.00),
        verificacionPago: false,
        numeroIngreso: 'ING-2025-001',
        numeroFactura: 'FAC-2025-001',
      };

      // Mock de dependencias
      const mockInscripcion = { idInscripcion: 1 };
      const mockDatosFacturacion = { idFacturacion: 1 };
      
      mockInscripcionFindUnique.mockResolvedValue(mockInscripcion);
      mockDatosFacturacionFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockFindFirst.mockResolvedValue(null); // No existe factura previa
      mockCreate.mockResolvedValue(prismaFactura);
      mockToFacturaResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await facturaService.createFactura(createFacturaDto);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          idInscripcion: createFacturaDto.idInscripcion,
          idFacturacion: createFacturaDto.idFacturacion,
          valorPagado: createFacturaDto.valorPagado,
          verificacionPago: false,
          numeroIngreso: createFacturaDto.numeroIngreso,
          numeroFactura: createFacturaDto.numeroFactura,
        },
      });
      expect(mockToFacturaResponseDto).toHaveBeenCalledWith(prismaFactura);
      expect(result).toEqual(expectedResponseDto);
    });

    it('SRV-FAC-002: debería lanzar NotFoundError cuando la inscripción no existe', async () => {
      // Arrange
      mockInscripcionFindUnique.mockResolvedValue(null);
      mockDatosFacturacionFindUnique.mockResolvedValue({ idFacturacion: 1 });

      // Act & Assert
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow(NotFoundError);
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow('Inscripción con ID 1');
    });

    it('SRV-FAC-003: debería lanzar NotFoundError cuando los datos de facturación no existen', async () => {
      // Arrange
      mockInscripcionFindUnique.mockResolvedValue({ idInscripcion: 1 });
      mockDatosFacturacionFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow(NotFoundError);
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow('Datos de facturación con ID 1');
    });

    it('SRV-FAC-004: debería lanzar ConflictError cuando ya existe una factura para la inscripción', async () => {
      // Arrange
      mockInscripcionFindUnique.mockResolvedValue({ idInscripcion: 1 });
      mockDatosFacturacionFindUnique.mockResolvedValue({ idFacturacion: 1 });
      mockFindFirst.mockResolvedValue({ idFactura: 1, idInscripcion: 1 }); // Factura existente

      // Act & Assert
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow(ConflictError);
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow('Ya existe una factura para la inscripción con ID 1');
    });

    it('SRV-FAC-005: debería manejar error de unicidad en número de factura', async () => {
      // Arrange
      mockInscripcionFindUnique.mockResolvedValue({ idInscripcion: 1 });
      mockDatosFacturacionFindUnique.mockResolvedValue({ idFacturacion: 1 });
      mockFindFirst.mockResolvedValue(null);
      
      const uniqueError = {
        code: 'P2002',
        meta: { target: ['numeroFactura'] }
      };
      mockCreate.mockRejectedValue(uniqueError);

      // Act & Assert
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow(ConflictError);
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow('El número de factura FAC-2025-001 ya está en uso');
    });

    it('SRV-FAC-005b: debería manejar error de unicidad en número de ingreso', async () => {
      // Arrange
      mockInscripcionFindUnique.mockResolvedValue({ idInscripcion: 1 });
      mockDatosFacturacionFindUnique.mockResolvedValue({ idFacturacion: 1 });
      mockFindFirst.mockResolvedValue(null);
      
      const uniqueError = {
        code: 'P2002',
        meta: { target: ['numeroIngreso'] }
      };
      mockCreate.mockRejectedValue(uniqueError);

      // Act & Assert
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow(ConflictError);
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow('El número de ingreso ING-2025-001 ya está en uso');
    });

    it('SRV-FAC-005c: debería manejar errores genéricos en la creación', async () => {
      // Arrange
      mockInscripcionFindUnique.mockResolvedValue({ idInscripcion: 1 });
      mockDatosFacturacionFindUnique.mockResolvedValue({ idFacturacion: 1 });
      mockFindFirst.mockResolvedValue(null);
      
      const dbError = new Error('Database connection failed');
      mockCreate.mockRejectedValue(dbError);

      // Act & Assert
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow('Error al crear la factura: Database connection failed');
    });

    it('SRV-FAC-005d: debería manejar errores desconocidos en la creación', async () => {
      // Arrange
      mockInscripcionFindUnique.mockResolvedValue({ idInscripcion: 1 });
      mockDatosFacturacionFindUnique.mockResolvedValue({ idFacturacion: 1 });
      mockFindFirst.mockResolvedValue(null);
      
      const unknownError = { message: 'Unknown error', code: 'UNKNOWN' };
      mockCreate.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(facturaService.createFactura(createFacturaDto))
        .rejects.toThrow('Error desconocido al crear la factura');
    });
  });

  describe('getFacturaById', () => {
    it('SRV-FAC-006: debería obtener una factura por ID sin relaciones', async () => {
      // Arrange
      const facturaId = 1;
      const prismaFactura = {
        idFactura: 1,
        idInscripcion: 1,
        idFacturacion: 1,
        valorPagado: new Decimal(150.00),
        verificacionPago: false,
        numeroIngreso: 'ING-2025-001',
        numeroFactura: 'FAC-2025-001',
      };

      mockFindUnique.mockResolvedValue(prismaFactura);
      mockToFacturaResponseDto.mockReturnValue(prismaFactura);

      // Act
      const result = await facturaService.getFacturaById(facturaId, false);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idFactura: facturaId },
      });
      expect(mockToFacturaResponseDto).toHaveBeenCalledWith(prismaFactura);
      expect(result).toEqual(prismaFactura);
    });

    it('SRV-FAC-006b: debería obtener una factura por ID con relaciones', async () => {
      // Arrange
      const facturaId = 1;
      const facturaConRelaciones = {
        idFactura: 1,
        idInscripcion: 1,
        idFacturacion: 1,
        valorPagado: new Decimal(150.00),
        verificacionPago: false,
        numeroIngreso: 'ING-2025-001',
        numeroFactura: 'FAC-2025-001',
        inscripcion: {
          idInscripcion: 1,
          curso: { nombre: 'Curso Test' },
          persona: { nombres: 'Juan', apellidos: 'Pérez' },
        },
        datosFacturacion: {
          idFacturacion: 1,
          razonSocial: 'Empresa Test S.A.',
        },
      };

      mockFindUnique.mockResolvedValue(facturaConRelaciones);
      mockToFacturaWithRelationsResponseDto.mockReturnValue(facturaConRelaciones);

      // Act
      const result = await facturaService.getFacturaById(facturaId, true);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idFactura: facturaId },
        include: {
          inscripcion: {
            include: {
              curso: true,
              persona: true,
            },
          },
          datosFacturacion: true,
        },
      });
      expect(mockToFacturaWithRelationsResponseDto).toHaveBeenCalledWith(facturaConRelaciones);
      expect(result).toEqual(facturaConRelaciones);
    });

    it('SRV-FAC-007: debería lanzar NotFoundError cuando la factura no existe', async () => {
      // Arrange
      const facturaId = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(facturaService.getFacturaById(facturaId))
        .rejects.toThrow(NotFoundError);
      await expect(facturaService.getFacturaById(facturaId))
        .rejects.toThrow('Factura con ID 999');
    });

    it('SRV-FAC-007b: debería manejar errores genéricos en getFacturaById', async () => {
      // Arrange
      const facturaId = 1;
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(facturaService.getFacturaById(facturaId))
        .rejects.toThrow('Error al obtener la factura: Database connection failed');
    });

    it('SRV-FAC-007c: debería manejar errores desconocidos en getFacturaById', async () => {
      // Arrange
      const facturaId = 1;
      const unknownError = { message: 'Unknown error', code: 'UNKNOWN' };
      mockFindUnique.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(facturaService.getFacturaById(facturaId))
        .rejects.toThrow('Error desconocido al obtener la factura');
    });
  });

  describe('verificarPago', () => {
    it('SRV-FAC-008: debería verificar el pago de una factura exitosamente', async () => {
      // Arrange
      const facturaId = 1;
      const facturaExistente = {
        idFactura: 1,
        idInscripcion: 1,
        idFacturacion: 1,
        valorPagado: new Decimal(150.00),
        verificacionPago: false,
        numeroIngreso: 'ING-2025-001',
        numeroFactura: 'FAC-2025-001',
      };

      const facturaVerificada = {
        ...facturaExistente,
        verificacionPago: true,
      };

      mockFindUnique.mockResolvedValue(facturaExistente);
      mockUpdate.mockResolvedValue(facturaVerificada);
      mockToFacturaResponseDto.mockReturnValue(facturaVerificada);

      // Act
      const result = await facturaService.verificarPago(facturaId);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { idFactura: facturaId },
        data: { verificacionPago: true },
      });
      expect(result).toEqual(facturaVerificada);
    });

    it('SRV-FAC-009: debería lanzar ConflictError cuando la factura ya está verificada', async () => {
      // Arrange
      const facturaId = 1;
      const facturaYaVerificada = {
        idFactura: 1,
        verificacionPago: true,
      };

      mockFindUnique.mockResolvedValue(facturaYaVerificada);

      // Act & Assert
      await expect(facturaService.verificarPago(facturaId))
        .rejects.toThrow(ConflictError);
      await expect(facturaService.verificarPago(facturaId))
        .rejects.toThrow('La factura con ID 1 ya está verificada');
    });
  });

  describe('deleteFactura', () => {
    it('SRV-FAC-010: debería eliminar una factura exitosamente', async () => {
      // Arrange
      const facturaId = 1;
      const facturaExistente = {
        idFactura: 1,
        idInscripcion: 1,
        idFacturacion: 1,
        valorPagado: new Decimal(150.00),
        verificacionPago: false,
        numeroIngreso: 'ING-2025-001',
        numeroFactura: 'FAC-2025-001',
      };

      mockFindUnique.mockResolvedValue(facturaExistente);
      mockDelete.mockResolvedValue(facturaExistente);
      mockToFacturaResponseDto.mockReturnValue(facturaExistente);

      // Act
      const result = await facturaService.deleteFactura(facturaId);

      // Assert
      expect(mockDelete).toHaveBeenCalledWith({
        where: { idFactura: facturaId },
      });
      expect(result).toEqual(facturaExistente);
    });

    it('SRV-FAC-011: debería lanzar ConflictError cuando se intenta eliminar factura verificada', async () => {
      // Arrange
      const facturaId = 1;
      const facturaVerificada = {
        idFactura: 1,
        verificacionPago: true,
      };

      mockFindUnique.mockResolvedValue(facturaVerificada);

      // Act & Assert
      await expect(facturaService.deleteFactura(facturaId))
        .rejects.toThrow(ConflictError);
      await expect(facturaService.deleteFactura(facturaId))
        .rejects.toThrow('La factura con ID 1 no puede ser eliminada porque ya está verificada');
    });
  });

  describe('getAllFacturas', () => {
    it('SRV-FAC-012: debería obtener todas las facturas sin relaciones', async () => {
      // Arrange
      const options = {
        page: 1,
        limit: 10,
        orderBy: 'numeroFactura',
        order: 'desc' as const,
        includeRelations: false,
      };

      const facturas = [
        {
          idFactura: 1,
          idInscripcion: 1,
          idFacturacion: 1,
          valorPagado: new Decimal(150.00),
          verificacionPago: false,
          numeroIngreso: 'ING-2025-001',
          numeroFactura: 'FAC-2025-001',
        },
        {
          idFactura: 2,
          idInscripcion: 2,
          idFacturacion: 2,
          valorPagado: new Decimal(200.00),
          verificacionPago: true,
          numeroIngreso: 'ING-2025-002',
          numeroFactura: 'FAC-2025-002',
        },
      ];

      mockFindMany.mockResolvedValue(facturas);
      mockCount.mockResolvedValue(2);
      mockToFacturaResponseDto
        .mockReturnValueOnce(facturas[0])
        .mockReturnValueOnce(facturas[1]);

      // Act
      const result = await facturaService.getAllFacturas(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { numeroFactura: 'desc' },
      });
      expect(result).toEqual({
        facturas: facturas,
        total: 2,
      });
    });

    it('SRV-FAC-013: debería obtener todas las facturas con relaciones', async () => {
      // Arrange
      const options = {
        page: 1,
        limit: 10,
        orderBy: 'numeroFactura',
        order: 'desc' as const,
        includeRelations: true,
      };

      const facturasConRelaciones = [
        {
          idFactura: 1,
          idInscripcion: 1,
          idFacturacion: 1,
          valorPagado: new Decimal(150.00),
          verificacionPago: false,
          numeroIngreso: 'ING-2025-001',
          numeroFactura: 'FAC-2025-001',
          inscripcion: {
            idInscripcion: 1,
            curso: { nombre: 'Curso Test' },
            persona: { nombres: 'Juan', apellidos: 'Pérez' },
          },
          datosFacturacion: {
            idFacturacion: 1,
            razonSocial: 'Empresa Test S.A.',
          },
        },
      ];

      mockFindMany.mockResolvedValue(facturasConRelaciones);
      mockCount.mockResolvedValue(1);
      mockToFacturaWithRelationsResponseDto.mockReturnValue(facturasConRelaciones[0]);

      // Act
      const result = await facturaService.getAllFacturas(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { numeroFactura: 'desc' },
        include: {
          inscripcion: {
            include: {
              curso: true,
              persona: true,
            },
          },
          datosFacturacion: true,
        },
      });
      expect(result).toEqual({
        facturas: [facturasConRelaciones[0]],
        total: 1,
      });
    });

    it('SRV-FAC-014: debería manejar errores genéricos en getAllFacturas', async () => {
      // Arrange
      const options = {
        page: 1,
        limit: 10,
        orderBy: 'numeroFactura',
        order: 'desc' as const,
      };

      const dbError = new Error('Database timeout');
      mockFindMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(facturaService.getAllFacturas(options))
        .rejects.toThrow('Error al obtener las facturas: Database timeout');
    });

    it('SRV-FAC-015: debería manejar errores desconocidos en getAllFacturas', async () => {
      // Arrange
      const options = {
        page: 1,
        limit: 10,
        orderBy: 'numeroFactura',
        order: 'desc' as const,
      };

      const unknownError = { message: 'Unknown error', code: 'UNKNOWN' };
      mockFindMany.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(facturaService.getAllFacturas(options))
        .rejects.toThrow('Error desconocido al obtener las facturas');
    });
  });

  describe('getFacturaByNumeroFactura', () => {
    it('SRV-FAC-016: debería obtener una factura por número de factura', async () => {
      // Arrange
      const numeroFactura = 'FAC-2025-001';
      const facturaConRelaciones = {
        idFactura: 1,
        idInscripcion: 1,
        idFacturacion: 1,
        valorPagado: new Decimal(150.00),
        verificacionPago: false,
        numeroIngreso: 'ING-2025-001',
        numeroFactura: 'FAC-2025-001',
        inscripcion: {
          idInscripcion: 1,
          curso: { nombre: 'Curso Test' },
          persona: { nombres: 'Juan', apellidos: 'Pérez' },
        },
        datosFacturacion: {
          idFacturacion: 1,
          razonSocial: 'Empresa Test S.A.',
        },
      };

      mockFindUnique.mockResolvedValue(facturaConRelaciones);
      mockToFacturaWithRelationsResponseDto.mockReturnValue(facturaConRelaciones);

      // Act
      const result = await facturaService.getFacturaByNumeroFactura(numeroFactura);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { numeroFactura },
        include: {
          inscripcion: {
            include: {
              curso: true,
              persona: true,
            },
          },
          datosFacturacion: true,
        },
      });
      expect(result).toEqual(facturaConRelaciones);
    });

    it('SRV-FAC-017: debería lanzar NotFoundError cuando no existe factura con el número', async () => {
      // Arrange
      const numeroFactura = 'FAC-2025-999';
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(facturaService.getFacturaByNumeroFactura(numeroFactura))
        .rejects.toThrow(NotFoundError);
      await expect(facturaService.getFacturaByNumeroFactura(numeroFactura))
        .rejects.toThrow('Factura con número FAC-2025-999');
    });

    it('SRV-FAC-018: debería manejar errores genéricos en getFacturaByNumeroFactura', async () => {
      // Arrange
      const numeroFactura = 'FAC-2025-001';
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(facturaService.getFacturaByNumeroFactura(numeroFactura))
        .rejects.toThrow('Error al obtener la factura: Database connection failed');
    });
  });

  describe('getFacturaByNumeroIngreso', () => {
    it('SRV-FAC-019: debería obtener una factura por número de ingreso', async () => {
      // Arrange
      const numeroIngreso = 'ING-2025-001';
      const facturaConRelaciones = {
        idFactura: 1,
        idInscripcion: 1,
        idFacturacion: 1,
        valorPagado: new Decimal(150.00),
        verificacionPago: false,
        numeroIngreso: 'ING-2025-001',
        numeroFactura: 'FAC-2025-001',
        inscripcion: {
          idInscripcion: 1,
          curso: { nombre: 'Curso Test' },
          persona: { nombres: 'Juan', apellidos: 'Pérez' },
        },
        datosFacturacion: {
          idFacturacion: 1,
          razonSocial: 'Empresa Test S.A.',
        },
      };

      mockFindUnique.mockResolvedValue(facturaConRelaciones);
      mockToFacturaWithRelationsResponseDto.mockReturnValue(facturaConRelaciones);

      // Act
      const result = await facturaService.getFacturaByNumeroIngreso(numeroIngreso);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { numeroIngreso },
        include: {
          inscripcion: {
            include: {
              curso: true,
              persona: true,
            },
          },
          datosFacturacion: true,
        },
      });
      expect(result).toEqual(facturaConRelaciones);
    });

    it('SRV-FAC-020: debería lanzar NotFoundError cuando no existe factura con el número de ingreso', async () => {
      // Arrange
      const numeroIngreso = 'ING-2025-999';
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(facturaService.getFacturaByNumeroIngreso(numeroIngreso))
        .rejects.toThrow(NotFoundError);
      await expect(facturaService.getFacturaByNumeroIngreso(numeroIngreso))
        .rejects.toThrow('Factura con número de ingreso ING-2025-999');
    });
  });

  describe('getFacturasByInscripcionId', () => {
    it('SRV-FAC-021: debería obtener facturas por ID de inscripción', async () => {
      // Arrange
      const idInscripcion = 1;
      const facturas = [
        {
          idFactura: 1,
          idInscripcion: 1,
          idFacturacion: 1,
          valorPagado: new Decimal(150.00),
          verificacionPago: false,
          numeroIngreso: 'ING-2025-001',
          numeroFactura: 'FAC-2025-001',
          inscripcion: {
            idInscripcion: 1,
            curso: { nombre: 'Curso Test' },
            persona: { nombres: 'Juan', apellidos: 'Pérez' },
          },
          datosFacturacion: {
            idFacturacion: 1,
            razonSocial: 'Empresa Test S.A.',
          },
        },
      ];

      mockFindMany.mockResolvedValue(facturas);
      mockToFacturaWithRelationsResponseDto.mockReturnValue(facturas[0]);

      // Act
      const result = await facturaService.getFacturasByInscripcionId(idInscripcion);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { idInscripcion },
        include: {
          inscripcion: {
            include: {
              curso: true,
              persona: true,
            },
          },
          datosFacturacion: true,
        },
      });
      expect(result).toEqual([facturas[0]]);
    });

    it('SRV-FAC-022: debería manejar errores genéricos en getFacturasByInscripcionId', async () => {
      // Arrange
      const idInscripcion = 1;
      const dbError = new Error('Database connection failed');
      mockFindMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(facturaService.getFacturasByInscripcionId(idInscripcion))
        .rejects.toThrow('Error al obtener las facturas: Database connection failed');
    });

    it('SRV-FAC-023: debería manejar errores desconocidos en getFacturasByInscripcionId', async () => {
      // Arrange
      const idInscripcion = 1;
      const unknownError = { message: 'Unknown error', code: 'UNKNOWN' };
      mockFindMany.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(facturaService.getFacturasByInscripcionId(idInscripcion))
        .rejects.toThrow('Error desconocido al obtener las facturas');
    });
  });
});

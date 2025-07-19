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

    // SRV-FAC-001: Crear una factura exitosamente
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

    // SRV-FAC-002: Error cuando la inscripción no existe
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

    // SRV-FAC-003: Error cuando los datos de facturación no existen
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

    // SRV-FAC-004: Error cuando ya existe una factura para la inscripción
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

    // SRV-FAC-005: Error de unicidad en número de factura
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
  });

  describe('getFacturaById', () => {
    // SRV-FAC-006: Obtener factura por ID sin relaciones
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

    // SRV-FAC-007: Error cuando la factura no existe
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
  });

  describe('verificarPago', () => {
    // SRV-FAC-008: Verificar pago exitosamente
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

    // SRV-FAC-009: Error cuando la factura ya está verificada
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
    // SRV-FAC-010: Eliminar factura exitosamente
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

    // SRV-FAC-011: Error cuando se intenta eliminar factura verificada
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
});

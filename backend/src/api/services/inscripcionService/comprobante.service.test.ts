// Mock del módulo Prisma
const mockCreate = jest.fn();
const mockFindUnique = jest.fn();
const mockDelete = jest.fn();
const mockFindMany = jest.fn();
const mockCount = jest.fn();
const mockTransaction = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    comprobante: {
      create: mockCreate,
      findUnique: mockFindUnique,
      delete: mockDelete,
      findMany: mockFindMany,
      count: mockCount,
    },
    $transaction: mockTransaction,
  })),
}));

// Mock del mapper
const mockToComprobanteResponseDto = jest.fn();
jest.mock('@/api/services/mappers/inscripcionMapper/comprobante.mapper', () => ({
  toComprobanteResponseDto: mockToComprobanteResponseDto,
}));

// Mock del helper para borrar archivos
const mockDeleteFile = jest.fn();
jest.mock('@/config/multer', () => ({
  deleteFile: mockDeleteFile,
}));

// Mock de console.warn para verificar logs
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

import { ComprobanteService } from './comprobante.service';
import { NotFoundError, ConflictError, AppError } from '@/utils/errorTypes';

describe('ComprobanteService', () => {
  let comprobanteService: ComprobanteService;

  beforeEach(() => {
    comprobanteService = new ComprobanteService();
    jest.clearAllMocks();
    
    // Mock por defecto del mapper
    mockToComprobanteResponseDto.mockImplementation((comprobante) => ({
      idComprobante: comprobante.idComprobante,
      rutaComprobante: comprobante.rutaComprobante,
      tipoArchivo: comprobante.tipoArchivo,
      nombreArchivo: comprobante.nombreArchivo,
      fechaSubida: comprobante.fechaSubida,
    }));
    
    // Mock por defecto de la transacción
    mockTransaction.mockImplementation(async (operations) => {
      if (Array.isArray(operations)) {
        // Simular que las operaciones son findMany y count
        return [
          await operations[0], // findMany result
          await operations[1]  // count result
        ];
      } else {
        // Si es una función callback, ejecutarla
        return await operations();
      }
    });
  });

  afterEach(() => {
    mockConsoleWarn.mockClear();
  });

  describe('createComprobante', () => {
    const comprobanteData = {
      rutaComprobante: '/uploads/comprobantes/test-file.jpg',
      tipoArchivo: 'image/jpeg',
      nombreArchivo: 'test-file.jpg'
    };

    // SRV-COM-001: Crear un registro de comprobante en la BD
    it('SRV-COM-001: debería crear un registro de comprobante en la BD', async () => {
      // Arrange
      const prismaComprobante = {
        idComprobante: 1,
        ...comprobanteData,
        fechaSubida: new Date('2025-06-30T12:00:00Z'),
      };
      const expectedResponseDto = {
        idComprobante: 1,
        ...comprobanteData,
        fechaSubida: new Date('2025-06-30T12:00:00Z'),
      };

      mockCreate.mockResolvedValue(prismaComprobante);
      mockToComprobanteResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await comprobanteService.createComprobante(comprobanteData);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          rutaComprobante: comprobanteData.rutaComprobante,
          tipoArchivo: comprobanteData.tipoArchivo,
          nombreArchivo: comprobanteData.nombreArchivo,
        },
      });
      expect(mockToComprobanteResponseDto).toHaveBeenCalledWith(prismaComprobante);
      expect(result).toEqual(expectedResponseDto);
    });

    it('debería manejar errores durante la creación', async () => {
      // Arrange
      const genericError = new Error('Database connection failed');
      mockCreate.mockRejectedValue(genericError);

      // Act & Assert
      await expect(comprobanteService.createComprobante(comprobanteData))
        .rejects.toThrow(AppError);
      await expect(comprobanteService.createComprobante(comprobanteData))
        .rejects.toThrow('Error al crear el comprobante en la base de datos: Database connection failed');
    });
  });

  describe('getComprobanteById', () => {
    // SRV-COM-002: Obtener un comprobante por un ID existente
    it('SRV-COM-002: debería obtener un comprobante por un ID existente', async () => {
      // Arrange
      const id = 1;
      const prismaComprobante = {
        idComprobante: id,
        rutaComprobante: '/uploads/comprobantes/test-file.jpg',
        tipoArchivo: 'image/jpeg',
        nombreArchivo: 'test-file.jpg',
        fechaSubida: new Date('2025-06-30T12:00:00Z'),
      };

      mockFindUnique.mockResolvedValue(prismaComprobante);

      // Act
      const result = await comprobanteService.getComprobanteById(id);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idComprobante: id },
      });
      expect(mockToComprobanteResponseDto).toHaveBeenCalledWith(prismaComprobante);
      expect(result).toBeDefined();
    });

    it('debería devolver null si el comprobante no existe', async () => {
      // Arrange
      const id = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act
      const result = await comprobanteService.getComprobanteById(id);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idComprobante: id },
      });
      expect(result).toBeNull();
      expect(mockToComprobanteResponseDto).not.toHaveBeenCalled();
    });

    it('debería manejar errores durante la búsqueda', async () => {
      // Arrange
      const id = 1;
      const genericError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(genericError);

      // Act & Assert
      await expect(comprobanteService.getComprobanteById(id))
        .rejects.toThrow(AppError);
    });
  });

  describe('deleteComprobante', () => {
    // SRV-COM-003: Eliminar un comprobante no asociado y su archivo físico
    it('SRV-COM-003: debería eliminar un comprobante no asociado y su archivo físico', async () => {
      // Arrange
      const id = 1;
      const prismaComprobanteWithoutInscripcion = {
        idComprobante: id,
        rutaComprobante: '/uploads/comprobantes/test-file.jpg',
        tipoArchivo: 'image/jpeg',
        nombreArchivo: 'test-file.jpg',
        fechaSubida: new Date('2025-06-30T12:00:00Z'),
        inscripcion: null, // No está asociado a ninguna inscripción
      };

      mockFindUnique.mockResolvedValue(prismaComprobanteWithoutInscripcion);
      mockDelete.mockResolvedValue(prismaComprobanteWithoutInscripcion);
      mockDeleteFile.mockResolvedValue(undefined);

      // Act
      await comprobanteService.deleteComprobante(id);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idComprobante: id },
        include: { inscripcion: true },
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { idComprobante: id },
      });
      expect(mockDeleteFile).toHaveBeenCalledWith('/uploads/comprobantes/test-file.jpg');
    });

    // SRV-COM-004: Falla al eliminar un comprobante asociado a una inscripción
    it('SRV-COM-004: debería fallar al eliminar un comprobante asociado a una inscripción', async () => {
      // Arrange
      const id = 1;
      const prismaComprobanteWithInscripcion = {
        idComprobante: id,
        rutaComprobante: '/uploads/comprobantes/test-file.jpg',
        tipoArchivo: 'image/jpeg',
        nombreArchivo: 'test-file.jpg',
        fechaSubida: new Date('2025-06-30T12:00:00Z'),
        inscripcion: { // Está asociado a una inscripción
          idInscripcion: 1,
          idPersona: 1,
          idCurso: 1,
          idComprobante: id,
        },
      };

      mockFindUnique.mockResolvedValue(prismaComprobanteWithInscripcion);

      // Act & Assert
      await expect(comprobanteService.deleteComprobante(id))
        .rejects.toThrow(ConflictError);
      await expect(comprobanteService.deleteComprobante(id))
        .rejects.toThrow(`El comprobante con ID ${id} no puede ser eliminado porque está asociado a la inscripción con ID 1.`);

      // Verify that delete and deleteFile are not called
      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    // SRV-COM-005: Maneja error al eliminar archivo físico después de borrar de la BD
    it('SRV-COM-005: debería manejar error al eliminar archivo físico después de borrar de la BD', async () => {
      // Arrange
      const id = 1;
      const prismaComprobanteWithoutInscripcion = {
        idComprobante: id,
        rutaComprobante: '/uploads/comprobantes/test-file.jpg',
        tipoArchivo: 'image/jpeg',
        nombreArchivo: 'test-file.jpg',
        fechaSubida: new Date('2025-06-30T12:00:00Z'),
        inscripcion: null,
      };

      mockFindUnique.mockResolvedValue(prismaComprobanteWithoutInscripcion);
      mockDelete.mockResolvedValue(prismaComprobanteWithoutInscripcion);
      mockDeleteFile.mockRejectedValue(new Error('File system error'));

      // Act
      await comprobanteService.deleteComprobante(id);

      // Assert
      expect(mockDelete).toHaveBeenCalledWith({
        where: { idComprobante: id },
      });
      expect(mockDeleteFile).toHaveBeenCalledWith('/uploads/comprobantes/test-file.jpg');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        `Registro de comprobante ${id} eliminado de la BD, pero falló la eliminación del archivo /uploads/comprobantes/test-file.jpg:`,
        expect.any(Error)
      );
    });

    // SRV-COM-006: Falla al eliminar si el ID no existe
    it('SRV-COM-006: debería fallar al eliminar si el ID no existe', async () => {
      // Arrange
      const id = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(comprobanteService.deleteComprobante(id))
        .rejects.toThrow(NotFoundError);
      await expect(comprobanteService.deleteComprobante(id))
        .rejects.toThrow('Comprobante');

      // Verify that delete and deleteFile are not called
      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    it('debería manejar errores durante la búsqueda del comprobante para eliminar', async () => {
      // Arrange
      const id = 1;
      const genericError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(genericError);

      // Act & Assert
      await expect(comprobanteService.deleteComprobante(id))
        .rejects.toThrow(Error);
    });

    it('debería manejar errores durante la eliminación de la base de datos', async () => {
      // Arrange
      const id = 1;
      const prismaComprobanteWithoutInscripcion = {
        idComprobante: id,
        rutaComprobante: '/uploads/comprobantes/test-file.jpg',
        tipoArchivo: 'image/jpeg',
        nombreArchivo: 'test-file.jpg',
        fechaSubida: new Date('2025-06-30T12:00:00Z'),
        inscripcion: null,
      };
      const dbError = new Error('Database deletion failed');

      mockFindUnique.mockResolvedValue(prismaComprobanteWithoutInscripcion);
      mockDelete.mockRejectedValue(dbError);

      // Act & Assert
      await expect(comprobanteService.deleteComprobante(id))
        .rejects.toThrow(AppError);
      
      // Verify that deleteFile is not called if DB deletion fails
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });
  });

  describe('getAllComprobantes', () => {
    it('debería obtener una lista paginada de comprobantes', async () => {
      // Arrange
      const options = { page: 1, limit: 10 };
      const prismaComprobantes = [
        {
          idComprobante: 1,
          rutaComprobante: '/uploads/comprobantes/test-file-1.jpg',
          tipoArchivo: 'image/jpeg',
          nombreArchivo: 'test-file-1.jpg',
          fechaSubida: new Date('2025-06-30T12:00:00Z'),
        },
        {
          idComprobante: 2,
          rutaComprobante: '/uploads/comprobantes/test-file-2.pdf',
          tipoArchivo: 'application/pdf',
          nombreArchivo: 'test-file-2.pdf',
          fechaSubida: new Date('2025-06-30T13:00:00Z'),
        }
      ];
      const totalCount = 2;

      // Configurar los mocks individuales
      mockFindMany.mockResolvedValue(prismaComprobantes);
      mockCount.mockResolvedValue(totalCount);

      // Mock para la transacción que usa los mocks configurados
      mockTransaction.mockImplementation(async (operations) => {
        const [findManyOp, countOp] = operations;
        return [await findManyOp, await countOp];
      });

      // Act
      const result = await comprobanteService.getAllComprobantes(options);

      // Assert
      expect(mockTransaction).toHaveBeenCalledWith([
        expect.any(Promise), // findMany promise
        expect.any(Promise)  // count promise
      ]);
      expect(result).toEqual({
        comprobantes: expect.any(Array),
        total: totalCount
      });
      expect(result.comprobantes).toHaveLength(2);
    });

    it('debería calcular correctamente el offset para la paginación', async () => {
      // Arrange
      const options = { page: 3, limit: 5 };
      
      // Configurar los mocks individuales
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Mock para la transacción que usa los mocks configurados
      mockTransaction.mockImplementation(async (operations) => {
        const [findManyOp, countOp] = operations;
        return [await findManyOp, await countOp];
      });

      // Act
      await comprobanteService.getAllComprobantes(options);

      // Assert
      expect(mockTransaction).toHaveBeenCalledWith([
        expect.any(Promise), // findMany promise con skip: 10
        expect.any(Promise)  // count promise
      ]);
    });

    it('debería manejar errores durante la obtención de comprobantes', async () => {
      // Arrange
      const options = { page: 1, limit: 10 };
      const dbError = new Error('Database error');
      
      // Configurar el mock para que falle la transacción
      mockTransaction.mockRejectedValue(dbError);

      // Act & Assert
      await expect(comprobanteService.getAllComprobantes(options))
        .rejects.toThrow(AppError);
      await expect(comprobanteService.getAllComprobantes(options))
        .rejects.toThrow('Error al obtener todos los comprobantes: Database error');
    });
  });
});

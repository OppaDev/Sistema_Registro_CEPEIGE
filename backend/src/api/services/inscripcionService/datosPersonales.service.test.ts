// Mock del módulo Prisma
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    datosPersonales: {
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
const mockToDatosPersonalesResponseDto = jest.fn();
jest.mock('@/api/services/mappers/inscripcionMapper/datosPersonales.mapper', () => ({
  toDatosPersonalesResponseDto: mockToDatosPersonalesResponseDto,
}));

// Mock del validador de cédulas
const mockValidateAndFormat = jest.fn();
jest.mock('@/utils/cedulaValidator', () => ({
  CedulaEcuatorianaValidator: {
    validateAndFormat: mockValidateAndFormat,
  },
}));

import { DatosPersonalesService } from './datosPersonales.service';
import { CreateDatosPersonalesDto, UpdateDatosPersonalesDto } from '@/api/dtos/inscripcionDto/datosPersonales.dto';
import { NotFoundError, ConflictError } from '@/utils/errorTypes';

describe('2.1. DatosPersonalesService', () => {
  let datosPersonalesService: DatosPersonalesService;

  beforeEach(() => {
    datosPersonalesService = new DatosPersonalesService();
    jest.clearAllMocks();
    
    // Mock por defecto del mapper
    mockToDatosPersonalesResponseDto.mockImplementation((datos) => ({
      idPersona: datos.idPersona,
      ciPasaporte: datos.ciPasaporte,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      numTelefono: datos.numTelefono,
      correo: datos.correo,
      pais: datos.pais,
      provinciaEstado: datos.provinciaEstado,
      ciudad: datos.ciudad,
      profesion: datos.profesion,
      institucion: datos.institucion,
    }));

    // Mock por defecto del validador
    mockValidateAndFormat.mockReturnValue('1234567890');
  });

  describe('createDatosPersonales', () => {
    const createDatosPersonalesDto: CreateDatosPersonalesDto = {
      ciPasaporte: '1234567890',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez González',
      numTelefono: '+593-2-123-4567',
      correo: 'juan.perez@email.com',
      pais: 'Ecuador',
      provinciaEstado: 'Pichincha',
      ciudad: 'Quito',
      profesion: 'Ingeniero de Sistemas',
      institucion: 'Universidad Central del Ecuador'
    };

    // SRV-DP-001: Crear un registro de datos personales exitosamente
    it('SRV-DP-001: debería crear un registro de datos personales exitosamente', async () => {
      // Arrange
      const prismaDatosPersonales = {
        idPersona: 1,
        ...createDatosPersonalesDto,
      };
      const expectedResponseDto = {
        idPersona: 1,
        ...createDatosPersonalesDto,
      };

      mockCreate.mockResolvedValue(prismaDatosPersonales);
      mockToDatosPersonalesResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await datosPersonalesService.createDatosPersonales(createDatosPersonalesDto);

      // Assert
      expect(mockValidateAndFormat).toHaveBeenCalledWith(createDatosPersonalesDto.ciPasaporte);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          ciPasaporte: '1234567890', // Cédula formateada
          nombres: createDatosPersonalesDto.nombres,
          apellidos: createDatosPersonalesDto.apellidos,
          numTelefono: createDatosPersonalesDto.numTelefono,
          correo: createDatosPersonalesDto.correo,
          pais: createDatosPersonalesDto.pais,
          provinciaEstado: createDatosPersonalesDto.provinciaEstado,
          ciudad: createDatosPersonalesDto.ciudad,
          profesion: createDatosPersonalesDto.profesion,
          institucion: createDatosPersonalesDto.institucion,
        },
      });
      expect(mockToDatosPersonalesResponseDto).toHaveBeenCalledWith(prismaDatosPersonales);
      expect(result).toEqual(expectedResponseDto);
    });

    // SRV-DP-002: Falla al crear si la cédula/pasaporte ya existe
    it('SRV-DP-002: debería fallar al crear si la cédula/pasaporte ya existe', async () => {
      // Arrange
      const prismaError = {
        code: 'P2002',
        meta: { target: ['ci_pasaporte'] }
      };
      mockCreate.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(datosPersonalesService.createDatosPersonales(createDatosPersonalesDto))
        .rejects.toThrow(ConflictError);
      await expect(datosPersonalesService.createDatosPersonales(createDatosPersonalesDto))
        .rejects.toThrow('El CI o Pasaporte ya está registrado');
    });

    it('SRV-DP-002b: debería fallar al crear si el correo ya existe', async () => {
      // Arrange
      const prismaError = {
        code: 'P2002',
        meta: { target: ['correo'] }
      };
      mockCreate.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(datosPersonalesService.createDatosPersonales(createDatosPersonalesDto))
        .rejects.toThrow(ConflictError);
      await expect(datosPersonalesService.createDatosPersonales(createDatosPersonalesDto))
        .rejects.toThrow('El correo electrónico ya está registrado');
    });

    it('debería fallar si la cédula no es válida', async () => {
      // Arrange
      mockValidateAndFormat.mockReturnValue(null);

      // Act & Assert
      await expect(datosPersonalesService.createDatosPersonales(createDatosPersonalesDto))
        .rejects.toThrow('La cédula proporcionada no es válida');
    });
  });

  describe('getAllDatosPersonales', () => {
    // SRV-DP-003: Obtener una lista paginada de datos personales
    it('SRV-DP-003: debería obtener una lista paginada de datos personales', async () => {
      // Arrange
      const options = { page: 1, limit: 10, order: 'asc' as const };
      const prismaDatosPersonales = [
        {
          idPersona: 1,
          ciPasaporte: '1234567890',
          nombres: 'Juan',
          apellidos: 'Pérez',
          numTelefono: '+593-2-123-4567',
          correo: 'juan@email.com',
          pais: 'Ecuador',
          provinciaEstado: 'Pichincha',
          ciudad: 'Quito',
          profesion: 'Ingeniero',
          institucion: 'Universidad Central'
        }
      ];
      const totalCount = 1;

      mockFindMany.mockResolvedValue(prismaDatosPersonales);
      mockCount.mockResolvedValue(totalCount);

      // Act
      const result = await datosPersonalesService.getAllDatosPersonales(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { apellidos: 'asc' },
      });
      expect(mockCount).toHaveBeenCalled();
      expect(mockToDatosPersonalesResponseDto).toHaveBeenCalledWith(prismaDatosPersonales[0]);
      expect(result).toEqual({
        datosPersonales: expect.any(Array),
        total: totalCount
      });
    });

    it('debería usar orderBy personalizado cuando se proporciona', async () => {
      // Arrange
      const options = { page: 2, limit: 5, order: 'desc' as const, orderBy: 'nombres' };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await datosPersonalesService.getAllDatosPersonales(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 5, // (page - 1) * limit = (2 - 1) * 5
        take: 5,
        orderBy: { nombres: 'desc' },
      });
    });
  });

  describe('getDatosPersonalesById', () => {
    // SRV-DP-004: Obtener datos personales por un ID existente
    it('SRV-DP-004: debería obtener datos personales por un ID existente', async () => {
      // Arrange
      const id = 1;
      const prismaDatosPersonales = {
        idPersona: id,
        ciPasaporte: '1234567890',
        nombres: 'Juan',
        apellidos: 'Pérez',
        numTelefono: '+593-2-123-4567',
        correo: 'juan@email.com',
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero',
        institucion: 'Universidad Central'
      };

      mockFindUnique.mockResolvedValue(prismaDatosPersonales);

      // Act
      const result = await datosPersonalesService.getDatosPersonalesById(id);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idPersona: id },
      });
      expect(mockToDatosPersonalesResponseDto).toHaveBeenCalledWith(prismaDatosPersonales);
      expect(result).toBeDefined();
    });

    // SRV-DP-005: Falla al obtener datos si el ID no existe
    it('SRV-DP-005: debería fallar al obtener datos si el ID no existe', async () => {
      // Arrange
      const id = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(datosPersonalesService.getDatosPersonalesById(id))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('updateDatosPersonales', () => {
    const updateDatosPersonalesDto: UpdateDatosPersonalesDto = {
      nombres: 'Juan Carlos Actualizado',
      numTelefono: '+593-2-987-6543',
    };

    // SRV-DP-006: Actualizar datos personales de un ID existente
    it('SRV-DP-006: debería actualizar datos personales de un ID existente', async () => {
      // Arrange
      const id = 1;
      const existingDatosPersonales = {
        idPersona: id,
        ciPasaporte: '1234567890',
        nombres: 'Juan',
        apellidos: 'Pérez',
        numTelefono: '+593-2-123-4567',
        correo: 'juan@email.com',
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero',
        institucion: 'Universidad Central'
      };
      const updatedDatosPersonales = {
        ...existingDatosPersonales,
        ...updateDatosPersonalesDto
      };

      mockFindUnique.mockResolvedValue(existingDatosPersonales);
      mockUpdate.mockResolvedValue(updatedDatosPersonales);

      // Act
      const result = await datosPersonalesService.updateDatosPersonales(id, updateDatosPersonalesDto);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idPersona: id },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { idPersona: id },
        data: updateDatosPersonalesDto,
      });
      expect(mockToDatosPersonalesResponseDto).toHaveBeenCalledWith(updatedDatosPersonales);
      expect(result).toBeDefined();
    });

    // SRV-DP-007: Falla al actualizar si el ID no existe
    it('SRV-DP-007: debería fallar al actualizar si el ID no existe', async () => {
      // Arrange
      const id = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(datosPersonalesService.updateDatosPersonales(id, updateDatosPersonalesDto))
        .rejects.toThrow(NotFoundError);
      
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debería manejar errores de conflicto durante la actualización', async () => {
      // Arrange
      const id = 1;
      const existingDatosPersonales = { idPersona: id };
      const prismaError = {
        code: 'P2002',
        meta: { target: ['correo'] }
      };

      mockFindUnique.mockResolvedValue(existingDatosPersonales);
      mockUpdate.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(datosPersonalesService.updateDatosPersonales(id, updateDatosPersonalesDto))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('deleteDatosPersonales', () => {
    // SRV-DP-008: Eliminar datos personales de un ID existente
    it('SRV-DP-008: debería eliminar datos personales de un ID existente', async () => {
      // Arrange
      const id = 1;
      const existingDatosPersonales = {
        idPersona: id,
        ciPasaporte: '1234567890',
        nombres: 'Juan',
        apellidos: 'Pérez',
        numTelefono: '+593-2-123-4567',
        correo: 'juan@email.com',
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero',
        institucion: 'Universidad Central'
      };

      mockFindUnique.mockResolvedValue(existingDatosPersonales);
      mockDelete.mockResolvedValue(existingDatosPersonales);

      // Act
      const result = await datosPersonalesService.deleteDatosPersonales(id);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idPersona: id },
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { idPersona: id },
      });
      expect(mockToDatosPersonalesResponseDto).toHaveBeenCalledWith(existingDatosPersonales);
      expect(result).toBeDefined();
    });

    // SRV-DP-009: Falla al eliminar si el ID no existe
    it('SRV-DP-009: debería fallar al eliminar si el ID no existe', async () => {
      // Arrange
      const id = 999;
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(datosPersonalesService.deleteDatosPersonales(id))
        .rejects.toThrow(NotFoundError);
      
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('getByCiPasaporte', () => {
    it('debería encontrar datos personales por CI/Pasaporte', async () => {
      // Arrange
      const ciPasaporte = '1234567890';
      const cedulaFormateada = '1234567890';
      const prismaDatosPersonales = {
        idPersona: 1,
        ciPasaporte: cedulaFormateada,
        nombres: 'Juan',
        apellidos: 'Pérez',
        numTelefono: '+593-2-123-4567',
        correo: 'juan@email.com',
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero',
        institucion: 'Universidad Central'
      };

      mockValidateAndFormat.mockReturnValue(cedulaFormateada);
      mockFindUnique.mockResolvedValue(prismaDatosPersonales);

      // Act
      const result = await datosPersonalesService.getByCiPasaporte(ciPasaporte);

      // Assert
      expect(mockValidateAndFormat).toHaveBeenCalledWith(ciPasaporte);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { ciPasaporte: cedulaFormateada },
      });
      expect(result).toBeDefined();
    });

    it('debería fallar si no encuentra datos por CI/Pasaporte', async () => {
      // Arrange
      const ciPasaporte = '1234567890';
      mockValidateAndFormat.mockReturnValue('1234567890');
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(datosPersonalesService.getByCiPasaporte(ciPasaporte))
        .rejects.toThrow(NotFoundError);
    });

    it('debería fallar si el CI/Pasaporte no es válido', async () => {
      // Arrange
      const ciPasaporte = '1234567890'; // CI de 10 dígitos pero inválido según el algoritmo
      mockValidateAndFormat.mockReturnValue(null);

      // Act & Assert
      await expect(datosPersonalesService.getByCiPasaporte(ciPasaporte))
        .rejects.toThrow('La cédula proporcionada no es válida');
    });
  });
});

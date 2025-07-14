// Mock del módulo Prisma
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();

// Mock de los métodos de otras tablas
const mockCursoFindUnique = jest.fn();
const mockDatosPersonalesFindUnique = jest.fn();
const mockDatosFacturacionFindUnique = jest.fn();
const mockComprobanteFindUnique = jest.fn();
const mockDescuentoFindUnique = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    inscripcion: {
      create: mockCreate,
      update: mockUpdate,
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      delete: mockDelete,
      count: mockCount,
    },
    curso: {
      findUnique: mockCursoFindUnique,
    },
    datosPersonales: {
      findUnique: mockDatosPersonalesFindUnique,
    },
    datosFacturacion: {
      findUnique: mockDatosFacturacionFindUnique,
    },
    comprobante: {
      findUnique: mockComprobanteFindUnique,
    },
    descuento: {
      findUnique: mockDescuentoFindUnique,
    },
  })),
}));

// Mock de los mappers
const mockToInscripcionResponseDto = jest.fn();
const mockToInscripcionAdminResponseDto = jest.fn();
jest.mock('@/api/services/mappers/inscripcion.mapper', () => ({
  toInscripcionResponseDto: mockToInscripcionResponseDto,
  toInscripcionAdminResponseDto: mockToInscripcionAdminResponseDto,
}));

import { InscripcionService } from './inscripcion.service';
import { CreateInscripcionDto, UpdateInscripcionDto } from '@/api/dtos/inscripcionDto/inscripcion.dto';
import { NotFoundError } from '@/utils/errorTypes';

describe('InscripcionService', () => {
  let inscripcionService: InscripcionService;

  // Mock objects used across tests
  const mockCurso = {
    idCurso: 1,
    valorCurso: 100.00,
  };

  const mockPersona = {
    idPersona: 1,
    nombres: 'Juan',
    apellidos: 'Pérez',
  };

  const mockDatosFacturacion = {
    idFacturacion: 1,
    razonSocial: 'Test S.A.',
  };

  const mockComprobante = {
    idComprobante: 1,
    nombreArchivo: 'comprobante.pdf',
  };

  beforeEach(() => {
    inscripcionService = new InscripcionService();
    jest.clearAllMocks();
    
    // Mock por defecto del mapper
    mockToInscripcionResponseDto.mockImplementation((inscripcion) => ({
      idInscripcion: inscripcion.idInscripcion,
      fechaInscripcion: inscripcion.fechaInscripcion,
      curso: inscripcion.curso,
      datosPersonales: inscripcion.persona,
      datosFacturacion: inscripcion.datosFacturacion,
      comprobante: inscripcion.comprobante,
    }));

    mockToInscripcionAdminResponseDto.mockImplementation((inscripcion) => ({
      idInscripcion: inscripcion.idInscripcion,
      fechaInscripcion: inscripcion.fechaInscripcion,
      matricula: inscripcion.matricula,
      curso: inscripcion.curso,
      datosPersonales: inscripcion.persona,
      datosFacturacion: inscripcion.datosFacturacion,
      comprobante: inscripcion.comprobante,
      ...(inscripcion.descuento && { descuento: inscripcion.descuento }),
    }));
  });

  describe('createInscripcion', () => {
    const createInscripcionDto: CreateInscripcionDto = {
      idCurso: 1,
      idPersona: 1,
      idFacturacion: 1,
      idComprobante: 1,
    };

    // SRV-INS-001: Crear inscripción válida (sin descuento, se aplica después)
    it('SRV-INS-001: debería crear una inscripción válida', async () => {
      // Arrange
      const expectedInscripcion = {
        idInscripcion: 1,
        fechaInscripcion: expect.any(Date),
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        curso: mockCurso,
        persona: mockPersona,
        datosFacturacion: mockDatosFacturacion,
        comprobante: mockComprobante,
      };

      const expectedResponseDto = {
        idInscripcion: 1,
        fechaInscripcion: expect.any(Date),
        curso: mockCurso,
        datosPersonales: mockPersona,
        datosFacturacion: mockDatosFacturacion,
        comprobante: mockComprobante,
      };

      mockCursoFindUnique.mockResolvedValue(mockCurso);
      mockDatosPersonalesFindUnique.mockResolvedValue(mockPersona);
      mockDatosFacturacionFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockComprobanteFindUnique.mockResolvedValue(mockComprobante);
      mockFindUnique.mockResolvedValue(null); // No hay inscripción con este comprobante
      mockFindFirst.mockResolvedValue(null); // No hay inscripción duplicada
      mockCreate.mockResolvedValue(expectedInscripcion);
      mockToInscripcionResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await inscripcionService.createInscripcion(createInscripcionDto);

      // Assert
      expect(mockCursoFindUnique).toHaveBeenCalledWith({
        where: { idCurso: 1 },
      });
      expect(mockDatosPersonalesFindUnique).toHaveBeenCalledWith({
        where: { idPersona: 1 },
      });
      expect(mockDatosFacturacionFindUnique).toHaveBeenCalledWith({
        where: { idFacturacion: 1 },
      });
      expect(mockComprobanteFindUnique).toHaveBeenCalledWith({
        where: { idComprobante: 1 },
      });
      // Verificar que se busca si el comprobante ya está en uso
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idComprobante: 1 },
      });
      // Verificar que se busca si la persona ya está inscrita en el curso
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          idCurso: 1,
          idPersona: 1,
        },
      });
      // No se debe llamar mockDescuentoFindUnique porque no hay descuento en la creación
      expect(mockDescuentoFindUnique).not.toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          idCurso: 1,
          idPersona: 1,
          idFacturacion: 1,
          idComprobante: 1,
        }),
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
        }
      });
      expect(mockToInscripcionResponseDto).toHaveBeenCalledWith(expectedInscripcion);
      expect(result).toEqual(expectedResponseDto);
    });

    // SRV-INS-002: Falla si el curso no existe
    it('SRV-INS-002: debería fallar si el curso no existe', async () => {
      // Arrange
      mockCursoFindUnique.mockResolvedValue(null);
      mockDatosPersonalesFindUnique.mockResolvedValue(mockPersona);
      mockDatosFacturacionFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockComprobanteFindUnique.mockResolvedValue(mockComprobante);

      // Act & Assert
      await expect(inscripcionService.createInscripcion(createInscripcionDto))
        .rejects.toThrow(NotFoundError);
      
      expect(mockCreate).not.toHaveBeenCalled();
    });

    // SRV-INS-003: Falla si la persona no existe
    it('SRV-INS-003: debería fallar si la persona no existe', async () => {
      // Arrange
      mockCursoFindUnique.mockResolvedValue(mockCurso);
      mockDatosPersonalesFindUnique.mockResolvedValue(null);
      mockDatosFacturacionFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockComprobanteFindUnique.mockResolvedValue(mockComprobante);

      // Act & Assert
      await expect(inscripcionService.createInscripcion(createInscripcionDto))
        .rejects.toThrow(NotFoundError);
      
      expect(mockCreate).not.toHaveBeenCalled();
    });

    // SRV-INS-004: Falla si los datos de facturación no existen
    it('SRV-INS-004: debería fallar si los datos de facturación no existen', async () => {
      // Arrange
      mockCursoFindUnique.mockResolvedValue(mockCurso);
      mockDatosPersonalesFindUnique.mockResolvedValue(mockPersona);
      mockDatosFacturacionFindUnique.mockResolvedValue(null);
      mockComprobanteFindUnique.mockResolvedValue(mockComprobante);

      // Act & Assert
      await expect(inscripcionService.createInscripcion(createInscripcionDto))
        .rejects.toThrow(NotFoundError);
      
      expect(mockCreate).not.toHaveBeenCalled();
    });

    // SRV-INS-005: Falla si el comprobante no existe
    it('SRV-INS-005: debería fallar si el comprobante no existe', async () => {
      // Arrange
      mockCursoFindUnique.mockResolvedValue(mockCurso);
      mockDatosPersonalesFindUnique.mockResolvedValue(mockPersona);
      mockDatosFacturacionFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockComprobanteFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(inscripcionService.createInscripcion(createInscripcionDto))
        .rejects.toThrow(NotFoundError);
      
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debería crear inscripción sin descuento', async () => {
      // Arrange
      const expectedInscripcion = {
        idInscripcion: 1,
        fechaInscripcion: expect.any(Date),
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
      };

      mockCursoFindUnique.mockResolvedValue(mockCurso);
      mockDatosPersonalesFindUnique.mockResolvedValue(mockPersona);
      mockDatosFacturacionFindUnique.mockResolvedValue(mockDatosFacturacion);
      mockComprobanteFindUnique.mockResolvedValue(mockComprobante);
      mockCreate.mockResolvedValue(expectedInscripcion);
      mockToInscripcionResponseDto.mockReturnValue(expectedInscripcion);

      // Act
      const result = await inscripcionService.createInscripcion(createInscripcionDto);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          idCurso: 1,
          idPersona: 1,
          idFacturacion: 1,
          idComprobante: 1,
        }),
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
        }
      });
      expect(result).toEqual(expectedInscripcion);
    });
  });

  describe('updateInscripcion', () => {
    const updateInscripcionDto: UpdateInscripcionDto = {
      matricula: true,
    };

    const existingInscripcion = {
      idInscripcion: 1,
      fechaInscripcion: new Date(),
      matricula: false,
      idCurso: 1,
      idPersona: 1,
      idFacturacion: 1,
      idComprobante: 1,
      idDescuento: null,
      curso: mockCurso,
      persona: mockPersona,
      datosFacturacion: mockDatosFacturacion,
      comprobante: mockComprobante,
      descuento: null,
    };

    // SRV-INS-006: Actualizar inscripción existente
    it('SRV-INS-006: debería actualizar una inscripción existente', async () => {
      // Arrange
      const updatedInscripcion = {
        ...existingInscripcion,
        matricula: true,
      };

      const expectedResponseDto = {
        idInscripcion: 1,
        fechaInscripcion: existingInscripcion.fechaInscripcion,
        matricula: true,
        curso: mockCurso,
        datosPersonales: mockPersona,
        datosFacturacion: mockDatosFacturacion,
        comprobante: mockComprobante,
      };

      mockFindUnique.mockResolvedValue(existingInscripcion);
      mockUpdate.mockResolvedValue(updatedInscripcion);
      mockToInscripcionAdminResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await inscripcionService.updateInscripcion(1, updateInscripcionDto);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
        data: { matricula: true },
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
          descuento: true,
        }
      });
      expect(mockToInscripcionAdminResponseDto).toHaveBeenCalledWith(updatedInscripcion);
      expect(result).toEqual(expectedResponseDto);
    });

    // SRV-INS-007: Falla al actualizar inscripción inexistente
    it('SRV-INS-007: debería fallar al actualizar una inscripción inexistente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(inscripcionService.updateInscripcion(999, updateInscripcionDto))
        .rejects.toThrow(NotFoundError);
      
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    // SRV-INS-008: Actualizar inscripción con descuento
    it('SRV-INS-008: debería actualizar una inscripción con descuento', async () => {
      // Arrange
      const updateWithDescuentoDto: UpdateInscripcionDto = {
        idDescuento: 1,
        matricula: true,
      };

      const mockDescuento = {
        idDescuento: 1,
        porcentajeDescuento: 10,
      };

      const updatedInscripcion = {
        ...existingInscripcion,
        idDescuento: 1,
        matricula: true,
        descuento: mockDescuento,
      };

      const expectedResponseDto = {
        idInscripcion: 1,
        fechaInscripcion: existingInscripcion.fechaInscripcion,
        matricula: true,
        curso: mockCurso,
        datosPersonales: mockPersona,
        datosFacturacion: mockDatosFacturacion,
        comprobante: mockComprobante,
        descuento: mockDescuento,
      };

      mockFindUnique.mockResolvedValueOnce(existingInscripcion); // For initial check
      mockDescuentoFindUnique.mockResolvedValue(mockDescuento);
      mockUpdate.mockResolvedValue(updatedInscripcion);
      mockToInscripcionAdminResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await inscripcionService.updateInscripcion(1, updateWithDescuentoDto);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
      });
      expect(mockDescuentoFindUnique).toHaveBeenCalledWith({
        where: { idDescuento: 1 },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
        data: { idDescuento: 1, matricula: true },
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
          descuento: true,
        }
      });
      expect(mockToInscripcionAdminResponseDto).toHaveBeenCalledWith(updatedInscripcion);
      expect(result).toEqual(expectedResponseDto);
    });
  });

  describe('getInscripcionById', () => {
    const mockInscripcion = {
      idInscripcion: 1,
      fechaInscripcion: new Date(),
      matricula: true,
      idCurso: 1,
      idPersona: 1,
      idFacturacion: 1,
      idComprobante: 1,
      idDescuento: 1,
      curso: mockCurso,
      persona: mockPersona,
      datosFacturacion: mockDatosFacturacion,
      comprobante: mockComprobante,
      descuento: { idDescuento: 1, porcentajeDescuento: 10 },
    };

    // SRV-INS-009: Obtener inscripción por ID
    it('SRV-INS-009: debería obtener una inscripción por ID', async () => {
      // Arrange
      const expectedResponseDto = {
        idInscripcion: 1,
        fechaInscripcion: mockInscripcion.fechaInscripcion,
        matricula: true,
        curso: mockCurso,
        datosPersonales: mockPersona,
        datosFacturacion: mockDatosFacturacion,
        comprobante: mockComprobante,
        descuento: { idDescuento: 1, porcentajeDescuento: 10 },
      };

      mockFindUnique.mockResolvedValue(mockInscripcion);
      mockToInscripcionAdminResponseDto.mockReturnValue(expectedResponseDto);

      // Act
      const result = await inscripcionService.getInscripcionById(1);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
          descuento: true,
        }
      });
      expect(mockToInscripcionAdminResponseDto).toHaveBeenCalledWith(mockInscripcion);
      expect(result).toEqual(expectedResponseDto);
    });

    // SRV-INS-010: Falla al obtener inscripción inexistente
    it('SRV-INS-010: debería fallar al obtener una inscripción inexistente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(inscripcionService.getInscripcionById(999))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteInscripcion', () => {
    const mockInscripcion = {
      idInscripcion: 1,
      fechaInscripcion: new Date(),
      matricula: true,
      descuentoAplicado: 10.00,
      montoTotal: 90.00,
      idCurso: 1,
      idPersona: 1,
      idFacturacion: 1,
      idComprobante: 1,
      idDescuento: 1,
    };

    // SRV-INS-010: Eliminar inscripción existente
    it('SRV-INS-011: debería eliminar una inscripción existente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockInscripcion);
      mockDelete.mockResolvedValue(mockInscripcion);

      // Act
      const result = await inscripcionService.deleteInscripcion(1);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
      });
      expect(result).toBe(true);
    });

    // SRV-INS-011: Falla al eliminar inscripción inexistente
    it('SRV-INS-012: debería fallar al eliminar una inscripción inexistente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(inscripcionService.deleteInscripcion(999))
        .rejects.toThrow(NotFoundError);
      
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('getAllInscripciones', () => {
    const options = {
      page: 1,
      limit: 10,
      orderBy: 'fechaInscripcion',
      order: 'desc' as const,
    };

    const mockInscripciones = [
      {
        idInscripcion: 1,
        fechaInscripcion: new Date(),
        matricula: true,
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        idDescuento: 1,
        curso: { idCurso: 1, nombreCurso: 'Curso A' },
        persona: { idPersona: 1, nombres: 'Juan', apellidos: 'Pérez' },
        datosFacturacion: { idFacturacion: 1, razonSocial: 'Test S.A.' },
        comprobante: { idComprobante: 1, nombreArchivo: 'comprobante1.pdf' },
        descuento: { idDescuento: 1, porcentajeDescuento: 10 },
      },
      {
        idInscripcion: 2,
        fechaInscripcion: new Date(),
        matricula: false,
        idCurso: 2,
        idPersona: 2,
        idFacturacion: 2,
        idComprobante: 2,
        idDescuento: null,
        curso: { idCurso: 2, nombreCurso: 'Curso B' },
        persona: { idPersona: 2, nombres: 'María', apellidos: 'García' },
        datosFacturacion: { idFacturacion: 2, razonSocial: 'Empresa B S.A.' },
        comprobante: { idComprobante: 2, nombreArchivo: 'comprobante2.pdf' },
        descuento: null,
      },
    ];

    // SRV-INS-012: Obtener todas las inscripciones con paginación
    it('SRV-INS-013: debería obtener todas las inscripciones con paginación', async () => {
      // Arrange
      mockFindMany.mockResolvedValue(mockInscripciones);
      mockCount.mockResolvedValue(2);
      mockToInscripcionAdminResponseDto.mockImplementation((inscripcion) => inscripcion);

      // Act
      const result = await inscripcionService.getAllInscripciones(options);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { fechaInscripcion: 'desc' },
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
          descuento: true,
        },
      });
      expect(mockCount).toHaveBeenCalled();
      expect(result.inscripciones).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockToInscripcionAdminResponseDto).toHaveBeenCalledTimes(2);
    });

    it('debería calcular correctamente el skip para paginación', async () => {
      // Arrange
      const optionsPage2 = { ...options, page: 2, limit: 5 };
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await inscripcionService.getAllInscripciones(optionsPage2);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 5, // (page 2 - 1) * limit 5 = 5
        take: 5,
        orderBy: { fechaInscripcion: 'desc' },
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
          descuento: true,
        },
      });
    });
  });
});

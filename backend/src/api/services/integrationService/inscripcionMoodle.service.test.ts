import { InscripcionMoodleService } from './inscripcionMoodle.service';
import { NotFoundError, ConflictError } from '@/utils/errorTypes';
import { EstadoMatriculaMoodle } from '@/api/dtos/integrationDto/inscripcionMoodle.dto';

// Mock Prisma (evitar problema de hoisting de jest.mock)
var mockPrismaInscripcionMoodle: any;
var mockPrismaInscripcion: any;

jest.mock('@prisma/client', () => {
  mockPrismaInscripcionMoodle = {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };
  mockPrismaInscripcion = {
    findUnique: jest.fn(),
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      inscripcionMoodle: mockPrismaInscripcionMoodle,
      inscripcion: mockPrismaInscripcion,
    })),
    Decimal: jest.requireActual('@prisma/client/runtime/library').Decimal,
  };
});

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('InscripcionMoodleService', () => {
  let service: InscripcionMoodleService;

  const mockInscripcion = {
    idInscripcion: 1,
    idPersona: 1,
    idCurso: 1,
    idDescuento: null,
    idFacturacion: 1,
    idComprobante: 1,
    matricula: true,
    fechaInscripcion: new Date('2025-01-10T09:00:00Z'),
  };

  const mockInscripcionMoodle = {
    idInscripcionMoodle: 1,
    idInscripcion: 1,
    moodleUserId: 12345,
    moodleUsername: 'juan.perez',
    estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
    fechaMatricula: new Date('2025-01-15T10:00:00Z'),
    fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
    notas: 'Usuario matriculado exitosamente',
  };

  const mockCreateInscripcionMoodleDto = {
    idInscripcion: 1,
    moodleUserId: 12345,
    moodleUsername: 'juan.perez',
    estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
    notas: 'Usuario matriculado exitosamente',
  };

  beforeEach(() => {
    service = new InscripcionMoodleService();
    jest.clearAllMocks();
  });

  describe('createInscripcionMoodle', () => {
    
    // SRV-IMO-001: Crear integración Moodle exitosamente
    it('SRV-IMO-001: debe crear integración Moodle exitosamente', async () => {
      // Arrange
      mockPrismaInscripcion.findUnique.mockResolvedValue(mockInscripcion);
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(null);
      mockPrismaInscripcionMoodle.findFirst.mockResolvedValue(null);
      mockPrismaInscripcionMoodle.create.mockResolvedValue(mockInscripcionMoodle);

      // Act
      const result = await service.createInscripcionMoodle(mockCreateInscripcionMoodleDto);

      // Assert
      expect(result).toEqual({
        idInscripcionMoodle: 1,
        idInscripcion: 1,
        moodleUserId: 12345,
        moodleUsername: 'juan.perez',
        estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
        fechaMatricula: new Date('2025-01-15T10:00:00Z'),
        fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
        notas: 'Usuario matriculado exitosamente',
      });

      expect(mockPrismaInscripcion.findUnique).toHaveBeenCalledWith({ where: { idInscripcion: 1 } });
      expect(mockPrismaInscripcionMoodle.create).toHaveBeenCalledWith({
        data: {
          idInscripcion: 1,
          moodleUserId: 12345,
          moodleUsername: 'juan.perez',
          estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
          notas: 'Usuario matriculado exitosamente',
        }
      });
    });

    // SRV-IMO-002: Error cuando inscripción no existe
    it('SRV-IMO-002: debe lanzar NotFoundError cuando la inscripción no existe', async () => {
      // Arrange
      mockPrismaInscripcion.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createInscripcionMoodle(mockCreateInscripcionMoodleDto))
        .rejects.toThrow(NotFoundError);
      await expect(service.createInscripcionMoodle(mockCreateInscripcionMoodleDto))
        .rejects.toThrow('Inscripción con ID 1');
    });

    // SRV-IMO-003: Error cuando ya existe integración para la inscripción
    it('SRV-IMO-003: debe lanzar ConflictError cuando ya existe integración', async () => {
      // Arrange
      mockPrismaInscripcion.findUnique.mockResolvedValue(mockInscripcion);
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(mockInscripcionMoodle);

      // Act & Assert
      await expect(service.createInscripcionMoodle(mockCreateInscripcionMoodleDto))
        .rejects.toThrow(ConflictError);
      await expect(service.createInscripcionMoodle(mockCreateInscripcionMoodleDto))
        .rejects.toThrow('La inscripción con ID 1 ya tiene una integración con Moodle');
    });

    // SRV-IMO-004: Error cuando usuario Moodle ya está en uso en el mismo curso
    it('SRV-IMO-004: debe lanzar ConflictError cuando usuario Moodle ya está en uso', async () => {
      // Arrange
      mockPrismaInscripcion.findUnique.mockResolvedValue(mockInscripcion);
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(null);
      mockPrismaInscripcionMoodle.findFirst.mockResolvedValue(mockInscripcionMoodle);

      // Act & Assert
      await expect(service.createInscripcionMoodle(mockCreateInscripcionMoodleDto))
        .rejects.toThrow(ConflictError);
      await expect(service.createInscripcionMoodle(mockCreateInscripcionMoodleDto))
        .rejects.toThrow('El usuario de Moodle 12345 ya está matriculado en este curso');
    });

    // SRV-IMO-005: Crear con estado por defecto MATRICULADO
    it('SRV-IMO-005: debe crear con estado MATRICULADO por defecto', async () => {
      // Arrange
      const dtoSinEstado = { ...mockCreateInscripcionMoodleDto };
      delete (dtoSinEstado as any).estadoMatricula;
      
      mockPrismaInscripcion.findUnique.mockResolvedValue(mockInscripcion);
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(null);
      mockPrismaInscripcionMoodle.findFirst.mockResolvedValue(null);
      mockPrismaInscripcionMoodle.create.mockResolvedValue(mockInscripcionMoodle);

      // Act
      await service.createInscripcionMoodle(dtoSinEstado);

      // Assert
      expect(mockPrismaInscripcionMoodle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
        })
      });
    });

    // SRV-IMO-006: Crear sin notas (null por defecto)
    it('SRV-IMO-006: debe crear con notas null por defecto', async () => {
      // Arrange
      const dtoSinNotas = { ...mockCreateInscripcionMoodleDto };
      delete (dtoSinNotas as any).notas;
      
      mockPrismaInscripcion.findUnique.mockResolvedValue(mockInscripcion);
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(null);
      mockPrismaInscripcionMoodle.findFirst.mockResolvedValue(null);
      mockPrismaInscripcionMoodle.create.mockResolvedValue({ ...mockInscripcionMoodle, notas: null });

      // Act
      await service.createInscripcionMoodle(dtoSinNotas);

      // Assert
      expect(mockPrismaInscripcionMoodle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          notas: null,
        })
      });
    });
  });

  describe('updateInscripcionMoodle', () => {
    
    const mockUpdateDto = {
      moodleUserId: 54321,
      moodleUsername: 'nuevo.usuario',
      estadoMatricula: EstadoMatriculaMoodle.SUSPENDIDO,
      notas: 'Suspendido por falta de pago',
    };

    const mockInscripcionMoodleExistente = {
      ...mockInscripcionMoodle,
      inscripcion: mockInscripcion,
    };

    // SRV-IMO-007: Actualizar integración exitosamente
    it('SRV-IMO-007: debe actualizar integración Moodle exitosamente', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(mockInscripcionMoodleExistente);
      mockPrismaInscripcionMoodle.findFirst.mockResolvedValue(null);
      mockPrismaInscripcionMoodle.update.mockResolvedValue({ ...mockInscripcionMoodle, ...mockUpdateDto });

      // Act
      const result = await service.updateInscripcionMoodle(1, mockUpdateDto);

      // Assert
      expect(result.moodleUserId).toBe(54321);
      expect(result.estadoMatricula).toBe(EstadoMatriculaMoodle.SUSPENDIDO);
      expect(mockPrismaInscripcionMoodle.update).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
        data: mockUpdateDto
      });
    });

    // SRV-IMO-008: Error cuando integración no existe
    it('SRV-IMO-008: debe lanzar NotFoundError cuando la integración no existe', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateInscripcionMoodle(1, mockUpdateDto))
        .rejects.toThrow(NotFoundError);
      await expect(service.updateInscripcionMoodle(1, mockUpdateDto))
        .rejects.toThrow('Integración Moodle para inscripción con ID 1');
    });

    // SRV-IMO-009: Error cuando nuevo usuario Moodle está en uso
    it('SRV-IMO-009: debe lanzar ConflictError cuando nuevo usuario Moodle está en uso', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(mockInscripcionMoodleExistente);
      mockPrismaInscripcionMoodle.findFirst.mockResolvedValue({ ...mockInscripcionMoodle, idInscripcion: 2 });

      // Act & Assert
      await expect(service.updateInscripcionMoodle(1, mockUpdateDto))
        .rejects.toThrow(ConflictError);
      await expect(service.updateInscripcionMoodle(1, mockUpdateDto))
        .rejects.toThrow('El usuario de Moodle 54321 ya está matriculado en este curso');
    });

    // SRV-IMO-010: Actualización parcial
    it('SRV-IMO-010: debe permitir actualización parcial de campos', async () => {
      // Arrange
      const updateParcial = { estadoMatricula: EstadoMatriculaMoodle.COMPLETADO };
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(mockInscripcionMoodleExistente);
      mockPrismaInscripcionMoodle.update.mockResolvedValue({ ...mockInscripcionMoodle, estadoMatricula: EstadoMatriculaMoodle.COMPLETADO });

      // Act
      await service.updateInscripcionMoodle(1, updateParcial);

      // Assert
      expect(mockPrismaInscripcionMoodle.update).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
        data: { estadoMatricula: EstadoMatriculaMoodle.COMPLETADO }
      });
    });
  });

  describe('getInscripcionMoodleByIdInscripcion', () => {
    
    const mockInscripcionMoodleConInscripcion = {
      ...mockInscripcionMoodle,
      inscripcion: {
        ...mockInscripcion,
        persona: {
          nombres: 'Juan Carlos',
          apellidos: 'Pérez González',
          correo: 'juan.perez@email.com',
          ciPasaporte: '1234567890',
        },
        curso: {
          idCurso: 1,
          nombreCortoCurso: 'JS-2024',
          nombreCurso: 'JavaScript Básico',
        },
      },
    };

    // SRV-IMO-011: Obtener integración por ID de inscripción exitosamente
    it('SRV-IMO-011: debe obtener integración Moodle por ID de inscripción exitosamente', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(mockInscripcionMoodleConInscripcion);

      // Act
      const result = await service.getInscripcionMoodleByIdInscripcion(1);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        idInscripcionMoodle: 1,
        idInscripcion: 1,
        inscripcion: expect.objectContaining({
          idInscripcion: 1,
          persona: expect.objectContaining({
            nombres: 'Juan Carlos',
          }),
        }),
      }));
      expect(mockPrismaInscripcionMoodle.findUnique).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
        include: { 
          inscripcion: {
            include: {
              persona: true,
              curso: true
            }
          }
        }
      });
    });

    // SRV-IMO-012: Error cuando integración no existe
    it('SRV-IMO-012: debe lanzar NotFoundError cuando la integración no existe', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getInscripcionMoodleByIdInscripcion(1))
        .rejects.toThrow(NotFoundError);
      await expect(service.getInscripcionMoodleByIdInscripcion(1))
        .rejects.toThrow('Integración Moodle para inscripción con ID 1');
    });
  });

  describe('getAllInscripcionesMoodle', () => {
    
    const mockOptions = {
      page: 1,
      limit: 10,
      orderBy: 'fechaMatricula',
      order: 'desc' as 'desc',
      estado: EstadoMatriculaMoodle.MATRICULADO,
      cursoId: 1,
    };

    const mockInscripcionesMoodleConInscripcion = [
      {
        ...mockInscripcionMoodle,
        inscripcion: {
          ...mockInscripcion,
          persona: { nombres: 'Juan', apellidos: 'Pérez', correo: 'juan@email.com', ciPasaporte: '123' },
          curso: { idCurso: 1, nombreCortoCurso: 'JS-2024', nombreCurso: 'JavaScript' },
        },
      },
      {
        ...mockInscripcionMoodle,
        idInscripcionMoodle: 2,
        inscripcion: {
          ...mockInscripcion,
          persona: { nombres: 'María', apellidos: 'García', correo: 'maria@email.com', ciPasaporte: '456' },
          curso: { idCurso: 1, nombreCortoCurso: 'JS-2024', nombreCurso: 'JavaScript' },
        },
      },
    ];

    // SRV-IMO-013: Obtener todas las integraciones con filtros
    it('SRV-IMO-013: debe obtener todas las integraciones con filtros exitosamente', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findMany.mockResolvedValue(mockInscripcionesMoodleConInscripcion);
      mockPrismaInscripcionMoodle.count.mockResolvedValue(2);

      // Act
      const result = await service.getAllInscripcionesMoodle(mockOptions);

      // Assert
      expect(result.inscripcionesMoodle).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrismaInscripcionMoodle.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { 
          estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
          inscripcion: { idCurso: 1 }
        },
        orderBy: { fechaMatricula: 'desc' },
        include: { 
          inscripcion: {
            include: {
              persona: true,
              curso: true
            }
          }
        }
      });
    });

    // SRV-IMO-014: Obtener sin filtros opcionales
    it('SRV-IMO-014: debe obtener integraciones sin filtros opcionales', async () => {
      // Arrange
      const optionsSinFiltros = { 
        page: 1, 
        limit: 10, 
        orderBy: 'fechaMatricula', 
        order: 'asc' as 'asc' 
      };
      mockPrismaInscripcionMoodle.findMany.mockResolvedValue(mockInscripcionesMoodleConInscripcion);
      mockPrismaInscripcionMoodle.count.mockResolvedValue(2);

      // Act
      await service.getAllInscripcionesMoodle(optionsSinFiltros);

      // Assert
      expect(mockPrismaInscripcionMoodle.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { fechaMatricula: 'asc' },
        include: { 
          inscripcion: {
            include: {
              persona: true,
              curso: true
            }
          }
        }
      });
    });

    // SRV-IMO-015: Paginación con página diferente
    it('SRV-IMO-015: debe manejar paginación con página diferente', async () => {
      // Arrange
      const optionsPagina2 = { ...mockOptions, page: 2 };
      mockPrismaInscripcionMoodle.findMany.mockResolvedValue([]);
      mockPrismaInscripcionMoodle.count.mockResolvedValue(15);

      // Act
      const result = await service.getAllInscripcionesMoodle(optionsPagina2);

      // Assert
      expect(mockPrismaInscripcionMoodle.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        where: { 
          estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
          inscripcion: { idCurso: 1 }
        },
        orderBy: { fechaMatricula: 'desc' },
        include: { 
          inscripcion: {
            include: {
              persona: true,
              curso: true
            }
          }
        }
      });
      expect(result.total).toBe(15);
    });
  });

  describe('deleteInscripcionMoodle', () => {
    
    // SRV-IMO-016: Eliminar integración exitosamente
    it('SRV-IMO-016: debe eliminar integración Moodle exitosamente', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(mockInscripcionMoodle);
      mockPrismaInscripcionMoodle.delete.mockResolvedValue(mockInscripcionMoodle);

      // Act
      const result = await service.deleteInscripcionMoodle(1);

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaInscripcionMoodle.delete).toHaveBeenCalledWith({
        where: { idInscripcion: 1 }
      });
    });

    // SRV-IMO-017: Error cuando integración no existe
    it('SRV-IMO-017: debe lanzar NotFoundError cuando la integración no existe', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteInscripcionMoodle(1))
        .rejects.toThrow(NotFoundError);
      await expect(service.deleteInscripcionMoodle(1))
        .rejects.toThrow('Integración Moodle para inscripción con ID 1');
    });
  });

  describe('existeIntegracionMoodle', () => {
    
    // SRV-IMO-018: Verificar que integración existe
    it('SRV-IMO-018: debe retornar true cuando la integración existe', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(mockInscripcionMoodle);

      // Act
      const result = await service.existeIntegracionMoodle(1);

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaInscripcionMoodle.findUnique).toHaveBeenCalledWith({
        where: { idInscripcion: 1 }
      });
    });

    // SRV-IMO-019: Verificar que integración no existe
    it('SRV-IMO-019: debe retornar false cuando la integración no existe', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.existeIntegracionMoodle(1);

      // Assert
      expect(result).toBe(false);
    });

    // SRV-IMO-020: Manejar error en verificación
    it('SRV-IMO-020: debe retornar false cuando hay error en la verificación', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.existeIntegracionMoodle(1);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('obtenerMoodleUserId', () => {
    
    // SRV-IMO-021: Obtener ID de usuario Moodle exitosamente
    it('SRV-IMO-021: debe obtener ID de usuario Moodle exitosamente', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(mockInscripcionMoodle);

      // Act
      const result = await service.obtenerMoodleUserId(1);

      // Assert
      expect(result).toBe(12345);
    });

    // SRV-IMO-022: Retornar null cuando no hay usuario
    it('SRV-IMO-022: debe retornar null cuando no hay usuario Moodle', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue({ ...mockInscripcionMoodle, moodleUserId: null });

      // Act
      const result = await service.obtenerMoodleUserId(1);

      // Assert
      expect(result).toBe(null);
    });

    // SRV-IMO-023: Retornar null cuando integración no existe
    it('SRV-IMO-023: debe retornar null cuando la integración no existe', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.obtenerMoodleUserId(1);

      // Assert
      expect(result).toBe(null);
    });

    // SRV-IMO-024: Manejar error en obtención de ID
    it('SRV-IMO-024: debe retornar null cuando hay error', async () => {
      // Arrange
      mockPrismaInscripcionMoodle.findUnique.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.obtenerMoodleUserId(1);

      // Assert
      expect(result).toBe(null);
    });
  });

  describe('cambiarEstadoMatricula', () => {
    
    // SRV-IMO-025: Cambiar estado de matrícula exitosamente
    it('SRV-IMO-025: debe cambiar estado de matrícula exitosamente', async () => {
      // Arrange
      const inscripcionActualizada = { 
        ...mockInscripcionMoodle, 
        estadoMatricula: EstadoMatriculaMoodle.COMPLETADO,
        notas: 'Curso completado satisfactoriamente'
      };
      mockPrismaInscripcionMoodle.update.mockResolvedValue(inscripcionActualizada);

      // Act
      const result = await service.cambiarEstadoMatricula(1, EstadoMatriculaMoodle.COMPLETADO, 'Curso completado satisfactoriamente');

      // Assert
      expect(result.estadoMatricula).toBe(EstadoMatriculaMoodle.COMPLETADO);
      expect(result.notas).toBe('Curso completado satisfactoriamente');
      expect(mockPrismaInscripcionMoodle.update).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
        data: {
          estadoMatricula: EstadoMatriculaMoodle.COMPLETADO,
          notas: 'Curso completado satisfactoriamente'
        }
      });
    });

    // SRV-IMO-026: Cambiar estado sin notas
    it('SRV-IMO-026: debe cambiar estado sin actualizar notas', async () => {
      // Arrange
      const inscripcionActualizada = { 
        ...mockInscripcionMoodle, 
        estadoMatricula: EstadoMatriculaMoodle.SUSPENDIDO
      };
      mockPrismaInscripcionMoodle.update.mockResolvedValue(inscripcionActualizada);

      // Act
      await service.cambiarEstadoMatricula(1, EstadoMatriculaMoodle.SUSPENDIDO);

      // Assert
      expect(mockPrismaInscripcionMoodle.update).toHaveBeenCalledWith({
        where: { idInscripcion: 1 },
        data: {
          estadoMatricula: EstadoMatriculaMoodle.SUSPENDIDO
        }
      });
    });

    // SRV-IMO-027: Cambiar a estado DESMATRICULADO
    it('SRV-IMO-027: debe cambiar a estado DESMATRICULADO correctamente', async () => {
      // Arrange
      const inscripcionDesmatriculada = { 
        ...mockInscripcionMoodle, 
        estadoMatricula: EstadoMatriculaMoodle.DESMATRICULADO,
        notas: 'Desmatriculado a solicitud del estudiante'
      };
      mockPrismaInscripcionMoodle.update.mockResolvedValue(inscripcionDesmatriculada);

      // Act
      const result = await service.cambiarEstadoMatricula(1, EstadoMatriculaMoodle.DESMATRICULADO, 'Desmatriculado a solicitud del estudiante');

      // Assert
      expect(result.estadoMatricula).toBe(EstadoMatriculaMoodle.DESMATRICULADO);
      expect(result.notas).toBe('Desmatriculado a solicitud del estudiante');
    });
  });
});
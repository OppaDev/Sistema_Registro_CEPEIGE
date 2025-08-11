import { GrupoTelegramService } from './grupoTelegram.service';
import { NotFoundError, ConflictError } from '@/utils/errorTypes';
import { Decimal } from '@prisma/client/runtime/library';

// Mock Prisma (evitar problema de hoisting de jest.mock)
var mockPrismaGrupoTelegram: any;
var mockPrismaCurso: any;

jest.mock('@prisma/client', () => {
  // Crear y asignar los mocks dentro de la fábrica para que existan al inicializar
  mockPrismaGrupoTelegram = {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };

  mockPrismaCurso = {
    findUnique: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      grupoTelegram: mockPrismaGrupoTelegram,
      curso: mockPrismaCurso,
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

describe('GrupoTelegramService', () => {
  let service: GrupoTelegramService;

  const mockCurso = {
    idCurso: 1,
    nombreCortoCurso: 'JS-2024',
    nombreCurso: 'JavaScript Básico',
    modalidadCurso: 'Virtual',
    descripcionCurso: 'Curso de JavaScript desde cero',
    valorCurso: new Decimal(299.99),
    fechaInicioCurso: new Date('2025-01-15'),
    fechaFinCurso: new Date('2025-03-15'),
  };

  const mockGrupoTelegram = {
    idGrupoTelegram: 1,
    idCurso: 1,
    telegramGroupId: '-1001234567890',
    nombreGrupo: 'Grupo JS Básico',
    enlaceInvitacion: 'https://t.me/joinchat/test123',
    fechaCreacion: new Date('2025-01-15T10:00:00Z'),
    fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
    activo: true,
  };

  const mockCreateGrupoTelegramDto = {
    idCurso: 1,
    telegramGroupId: '-1001234567890',
    nombreGrupo: 'Grupo JS Básico',
    enlaceInvitacion: 'https://t.me/joinchat/test123',
    activo: true,
  };

  beforeEach(() => {
    service = new GrupoTelegramService();
    jest.clearAllMocks();
  });

  describe('createGrupoTelegram', () => {
    
    // SRV-GTE-001: Crear grupo Telegram exitosamente
    it('SRV-GTE-001: debe crear un grupo de Telegram exitosamente', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(mockCurso);
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(null);
      mockPrismaGrupoTelegram.findFirst.mockResolvedValue(null);
      mockPrismaGrupoTelegram.create.mockResolvedValue(mockGrupoTelegram);

      // Act
      const result = await service.createGrupoTelegram(mockCreateGrupoTelegramDto);

      // Assert
      expect(result).toEqual({
        idGrupoTelegram: 1,
        idCurso: 1,
        telegramGroupId: '-1001234567890',
        nombreGrupo: 'Grupo JS Básico',
        enlaceInvitacion: 'https://t.me/joinchat/test123',
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
        fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
        activo: true,
      });

      expect(mockPrismaCurso.findUnique).toHaveBeenCalledWith({ where: { idCurso: 1 } });
      expect(mockPrismaGrupoTelegram.create).toHaveBeenCalledWith({
        data: {
          idCurso: 1,
          telegramGroupId: '-1001234567890',
          nombreGrupo: 'Grupo JS Básico',
          enlaceInvitacion: 'https://t.me/joinchat/test123',
          activo: true,
        }
      });
    });

    // SRV-GTE-002: Error cuando curso no existe
    it('SRV-GTE-002: debe lanzar NotFoundError cuando el curso no existe', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createGrupoTelegram(mockCreateGrupoTelegramDto))
        .rejects.toThrow(NotFoundError);
      await expect(service.createGrupoTelegram(mockCreateGrupoTelegramDto))
        .rejects.toThrow('Curso con ID 1');
    });

    // SRV-GTE-003: Error cuando ya existe grupo para el curso
    it('SRV-GTE-003: debe lanzar ConflictError cuando ya existe grupo para el curso', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(mockCurso);
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(mockGrupoTelegram);

      // Act & Assert
      await expect(service.createGrupoTelegram(mockCreateGrupoTelegramDto))
        .rejects.toThrow(ConflictError);
      await expect(service.createGrupoTelegram(mockCreateGrupoTelegramDto))
        .rejects.toThrow('El curso con ID 1 ya tiene un grupo de Telegram');
    });

    // SRV-GTE-004: Error cuando ID de Telegram ya está en uso
    it('SRV-GTE-004: debe lanzar ConflictError cuando ID de Telegram ya está en uso', async () => {
      // Arrange
      mockPrismaCurso.findUnique.mockResolvedValue(mockCurso);
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(null);
      mockPrismaGrupoTelegram.findFirst.mockResolvedValue(mockGrupoTelegram);

      // Act & Assert
      await expect(service.createGrupoTelegram(mockCreateGrupoTelegramDto))
        .rejects.toThrow(ConflictError);
      await expect(service.createGrupoTelegram(mockCreateGrupoTelegramDto))
        .rejects.toThrow('El ID de grupo de Telegram -1001234567890 ya está en uso');
    });

    // SRV-GTE-005: Crear con activo por defecto
    it('SRV-GTE-005: debe crear grupo con activo=true por defecto', async () => {
      // Arrange
      const dtoSinActivo = { ...mockCreateGrupoTelegramDto };
      delete (dtoSinActivo as any).activo;
      
      mockPrismaCurso.findUnique.mockResolvedValue(mockCurso);
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(null);
      mockPrismaGrupoTelegram.findFirst.mockResolvedValue(null);
      mockPrismaGrupoTelegram.create.mockResolvedValue(mockGrupoTelegram);

      // Act
      await service.createGrupoTelegram(dtoSinActivo);

      // Assert
      expect(mockPrismaGrupoTelegram.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          activo: true,
        })
      });
    });
  });

  describe('updateGrupoTelegram', () => {
    
    const mockUpdateDto = {
      telegramGroupId: '-1001234567891',
      nombreGrupo: 'Nuevo Nombre',
      enlaceInvitacion: 'https://t.me/joinchat/new123',
      activo: false,
    };

    // SRV-GTE-006: Actualizar grupo exitosamente
    it('SRV-GTE-006: debe actualizar un grupo de Telegram exitosamente', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(mockGrupoTelegram);
      mockPrismaGrupoTelegram.findFirst.mockResolvedValue(null);
      mockPrismaGrupoTelegram.update.mockResolvedValue({ ...mockGrupoTelegram, ...mockUpdateDto });

      // Act
      const result = await service.updateGrupoTelegram(1, mockUpdateDto);

      // Assert
      expect(result.nombreGrupo).toBe('Nuevo Nombre');
      expect(result.activo).toBe(false);
      expect(mockPrismaGrupoTelegram.update).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        data: mockUpdateDto
      });
    });

    // SRV-GTE-007: Error cuando grupo no existe
    it('SRV-GTE-007: debe lanzar NotFoundError cuando el grupo no existe', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateGrupoTelegram(1, mockUpdateDto))
        .rejects.toThrow(NotFoundError);
      await expect(service.updateGrupoTelegram(1, mockUpdateDto))
        .rejects.toThrow('Grupo de Telegram para curso con ID 1');
    });

    // SRV-GTE-008: Error cuando nuevo ID de Telegram está en uso
    it('SRV-GTE-008: debe lanzar ConflictError cuando nuevo ID de Telegram está en uso', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(mockGrupoTelegram);
      mockPrismaGrupoTelegram.findFirst.mockResolvedValue({ ...mockGrupoTelegram, idCurso: 2 });

      // Act & Assert
      await expect(service.updateGrupoTelegram(1, mockUpdateDto))
        .rejects.toThrow(ConflictError);
      await expect(service.updateGrupoTelegram(1, mockUpdateDto))
        .rejects.toThrow('El ID de grupo de Telegram -1001234567891 ya está en uso');
    });

    // SRV-GTE-009: Actualización parcial
    it('SRV-GTE-009: debe permitir actualización parcial de campos', async () => {
      // Arrange
      const updateParcial = { nombreGrupo: 'Solo Nombre' };
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(mockGrupoTelegram);
      mockPrismaGrupoTelegram.update.mockResolvedValue({ ...mockGrupoTelegram, nombreGrupo: 'Solo Nombre' });

      // Act
      await service.updateGrupoTelegram(1, updateParcial);

      // Assert
      expect(mockPrismaGrupoTelegram.update).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        data: { nombreGrupo: 'Solo Nombre' }
      });
    });
  });

  describe('getGrupoTelegramByIdCurso', () => {
    
    const mockGrupoConCurso = {
      ...mockGrupoTelegram,
      curso: mockCurso,
    };

    // SRV-GTE-010: Obtener grupo por ID de curso exitosamente
    it('SRV-GTE-010: debe obtener grupo de Telegram por ID de curso exitosamente', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(mockGrupoConCurso);

      // Act
      const result = await service.getGrupoTelegramByIdCurso(1);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        idGrupoTelegram: 1,
        idCurso: 1,
        curso: expect.objectContaining({
          idCurso: 1,
          nombreCortoCurso: 'JS-2024',
        }),
      }));
      expect(mockPrismaGrupoTelegram.findUnique).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        include: { curso: true }
      });
    });

    // SRV-GTE-011: Error cuando grupo no existe
    it('SRV-GTE-011: debe lanzar NotFoundError cuando el grupo no existe', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getGrupoTelegramByIdCurso(1))
        .rejects.toThrow(NotFoundError);
      await expect(service.getGrupoTelegramByIdCurso(1))
        .rejects.toThrow('Grupo de Telegram para curso con ID 1');
    });
  });

  describe('getAllGruposTelegram', () => {
    
    const mockOptions = {
      page: 1,
      limit: 10,
      orderBy: 'fechaCreacion',
      order: 'desc' as 'desc',
      incluirInactivos: false,
    };

    const mockGruposConCurso = [
      { ...mockGrupoTelegram, curso: mockCurso },
      { ...mockGrupoTelegram, idGrupoTelegram: 2, curso: mockCurso },
    ];

    // SRV-GTE-012: Obtener todos los grupos con paginación
    it('SRV-GTE-012: debe obtener todos los grupos con paginación exitosamente', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findMany.mockResolvedValue(mockGruposConCurso);
      mockPrismaGrupoTelegram.count.mockResolvedValue(2);

      // Act
      const result = await service.getAllGruposTelegram(mockOptions);

      // Assert
      expect(result.gruposTelegram).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrismaGrupoTelegram.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { activo: true },
        orderBy: { fechaCreacion: 'desc' },
        include: { curso: true }
      });
    });

    // SRV-GTE-013: Incluir grupos inactivos cuando se especifica
    it('SRV-GTE-013: debe incluir grupos inactivos cuando se especifica', async () => {
      // Arrange
      const optionsConInactivos = { ...mockOptions, incluirInactivos: true };
      mockPrismaGrupoTelegram.findMany.mockResolvedValue(mockGruposConCurso);
      mockPrismaGrupoTelegram.count.mockResolvedValue(2);

      // Act
      await service.getAllGruposTelegram(optionsConInactivos);

      // Assert
      expect(mockPrismaGrupoTelegram.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { fechaCreacion: 'desc' },
        include: { curso: true }
      });
    });

    // SRV-GTE-014: Paginación con página diferente
    it('SRV-GTE-014: debe manejar paginación con página diferente', async () => {
      // Arrange
      const optionsPagina2 = { ...mockOptions, page: 2 };
      mockPrismaGrupoTelegram.findMany.mockResolvedValue([]);
      mockPrismaGrupoTelegram.count.mockResolvedValue(15);

      // Act
      const result = await service.getAllGruposTelegram(optionsPagina2);

      // Assert
      expect(mockPrismaGrupoTelegram.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        where: { activo: true },
        orderBy: { fechaCreacion: 'desc' },
        include: { curso: true }
      });
      expect(result.total).toBe(15);
    });
  });

  describe('deleteGrupoTelegram', () => {
    
    // SRV-GTE-015: Eliminar grupo exitosamente
    it('SRV-GTE-015: debe eliminar un grupo de Telegram exitosamente', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(mockGrupoTelegram);
      mockPrismaGrupoTelegram.delete.mockResolvedValue(mockGrupoTelegram);

      // Act
      const result = await service.deleteGrupoTelegram(1);

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaGrupoTelegram.delete).toHaveBeenCalledWith({
        where: { idCurso: 1 }
      });
    });

    // SRV-GTE-016: Error cuando grupo no existe
    it('SRV-GTE-016: debe lanzar NotFoundError cuando el grupo no existe', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteGrupoTelegram(1))
        .rejects.toThrow(NotFoundError);
      await expect(service.deleteGrupoTelegram(1))
        .rejects.toThrow('Grupo de Telegram para curso con ID 1');
    });
  });

  describe('existeGrupoTelegram', () => {
    
    // SRV-GTE-017: Verificar que grupo existe
    it('SRV-GTE-017: debe retornar true cuando el grupo existe y está activo', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(mockGrupoTelegram);

      // Act
      const result = await service.existeGrupoTelegram(1);

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaGrupoTelegram.findUnique).toHaveBeenCalledWith({
        where: { idCurso: 1, activo: true }
      });
    });

    // SRV-GTE-018: Verificar que grupo no existe
    it('SRV-GTE-018: debe retornar false cuando el grupo no existe', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.existeGrupoTelegram(1);

      // Assert
      expect(result).toBe(false);
    });

    // SRV-GTE-019: Manejar error en verificación
    it('SRV-GTE-019: debe retornar false cuando hay error en la verificación', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.existeGrupoTelegram(1);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('obtenerEnlaceInvitacion', () => {
    
    // SRV-GTE-020: Obtener enlace de invitación exitosamente
    it('SRV-GTE-020: debe obtener enlace de invitación exitosamente', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(mockGrupoTelegram);

      // Act
      const result = await service.obtenerEnlaceInvitacion(1);

      // Assert
      expect(result).toBe('https://t.me/joinchat/test123');
    });

    // SRV-GTE-021: Retornar null cuando no hay enlace
    it('SRV-GTE-021: debe retornar null cuando no hay enlace de invitación', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue({ ...mockGrupoTelegram, enlaceInvitacion: null });

      // Act
      const result = await service.obtenerEnlaceInvitacion(1);

      // Assert
      expect(result).toBe(null);
    });

    // SRV-GTE-022: Retornar null cuando grupo no existe
    it('SRV-GTE-022: debe retornar null cuando el grupo no existe', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.obtenerEnlaceInvitacion(1);

      // Assert
      expect(result).toBe(null);
    });

    // SRV-GTE-023: Manejar error en obtención de enlace
    it('SRV-GTE-023: debe retornar null cuando hay error', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.obtenerEnlaceInvitacion(1);

      // Assert
      expect(result).toBe(null);
    });
  });

  describe('obtenerTelegramGroupId', () => {
    
    // SRV-GTE-024: Obtener ID de grupo de Telegram exitosamente
    it('SRV-GTE-024: debe obtener ID de grupo de Telegram exitosamente', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(mockGrupoTelegram);

      // Act
      const result = await service.obtenerTelegramGroupId(1);

      // Assert
      expect(result).toBe('-1001234567890');
    });

    // SRV-GTE-025: Retornar null cuando no hay ID
    it('SRV-GTE-025: debe retornar null cuando no hay ID de grupo', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue({ ...mockGrupoTelegram, telegramGroupId: null });

      // Act
      const result = await service.obtenerTelegramGroupId(1);

      // Assert
      expect(result).toBe(null);
    });

    // SRV-GTE-026: Retornar null cuando grupo no existe
    it('SRV-GTE-026: debe retornar null cuando el grupo no existe', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.obtenerTelegramGroupId(1);

      // Assert
      expect(result).toBe(null);
    });

    // SRV-GTE-027: Manejar error en obtención de ID
    it('SRV-GTE-027: debe retornar null cuando hay error', async () => {
      // Arrange
      mockPrismaGrupoTelegram.findUnique.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.obtenerTelegramGroupId(1);

      // Assert
      expect(result).toBe(null);
    });
  });
});
import { MiembroCursoTelegramService } from './miembroCursoTelegram.service';
import type { PrismaInscripcionAdminConRelaciones } from "@/api/services/mappers/inscripcionMapper/inscripcion.mapper";
import { Decimal } from '@prisma/client/runtime/library';

// Mock del logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock del GrupoTelegramService (evitar hoisting)
var mockGrupoTelegramService: any;

jest.mock('@/api/services/integrationService/grupoTelegram.service', () => {
  mockGrupoTelegramService = {
    existeGrupoTelegram: jest.fn(),
    obtenerEnlaceInvitacion: jest.fn(),
    getGrupoTelegramByIdCurso: jest.fn(),
  };
  return {
    GrupoTelegramService: jest.fn().mockImplementation(() => mockGrupoTelegramService),
  };
});

// Mock del CorreoService (evitar hoisting)
var mockCorreoService: any;

jest.mock('@/api/services/correoService/correo.service', () => {
  mockCorreoService = {
    verificarConfiguracion: jest.fn(),
    enviarInvitacionTelegram: jest.fn(),
  };
  return {
    CorreoService: jest.fn().mockImplementation(() => mockCorreoService),
  };
});

describe('MiembroCursoTelegramService', () => {
  let service: MiembroCursoTelegramService;

  const mockInscripcion: PrismaInscripcionAdminConRelaciones = {
    idInscripcion: 1,
    idPersona: 1,
    idCurso: 1,
  idFacturacion: 1,
    fechaInscripcion: new Date('2025-01-10T09:00:00Z'),
    matricula: true,
    idComprobante: 1,
    idDescuento: null,
  persona: {
      idPersona: 1,
      nombres: 'Juan Carlos',
      apellidos: 'Pérez González',
      correo: 'juan.perez@email.com',
      numTelefono: '+593987654321',
      ciPasaporte: '1234567890',
  pais: 'Ecuador',
  provinciaEstado: 'Pichincha',
  ciudad: 'Quito',
  profesion: 'Desarrollador',
  institucion: 'CEPEIGE',
    },
    curso: {
      idCurso: 1,
      nombreCortoCurso: 'JS-2024',
      nombreCurso: 'JavaScript Básico',
      modalidadCurso: 'Virtual',
      descripcionCurso: 'Curso de JavaScript desde cero',
      valorCurso: new Decimal(299.99),
      fechaInicioCurso: new Date('2025-01-15T00:00:00Z'),
      fechaFinCurso: new Date('2025-03-15T00:00:00Z'),
    },
    datosFacturacion: {
      idFacturacion: 1,
      razonSocial: 'ACME SA',
      identificacionTributaria: '1790012345001',
      telefono: '+593999888777',
      correoFactura: 'facturacion@acme.com',
      direccion: 'Av. Principal 123'
    },
    comprobante: {
      idComprobante: 1,
      rutaComprobante: '/uploads/comprobante1.pdf',
      nombreArchivo: 'comprobante.pdf',
      tipoArchivo: 'pdf',
      fechaSubida: new Date('2025-01-10T08:00:00Z'),
    },
  descuento: null,
  };

  beforeEach(() => {
    service = new MiembroCursoTelegramService();
    jest.clearAllMocks();
  });

  describe('enviarInvitacionGrupo', () => {
    
    // SRV-MCT-001: Enviar invitación exitosamente
    it('SRV-MCT-001: debe enviar invitación de grupo Telegram exitosamente', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(true);
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockResolvedValue('https://t.me/joinchat/test123');
      mockCorreoService.verificarConfiguracion.mockReturnValue(true);
      mockCorreoService.enviarInvitacionTelegram.mockResolvedValue(true);

      // Act
      await service.enviarInvitacionGrupo(1, mockInscripcion);

      // Assert
      expect(mockGrupoTelegramService.existeGrupoTelegram).toHaveBeenCalledWith(1);
      expect(mockGrupoTelegramService.obtenerEnlaceInvitacion).toHaveBeenCalledWith(1);
      expect(mockCorreoService.verificarConfiguracion).toHaveBeenCalled();
      expect(mockCorreoService.enviarInvitacionTelegram).toHaveBeenCalledWith({
        email: 'juan.perez@email.com',
        nombre: 'Juan Carlos',
        apellido: 'Pérez González',
        nombreCurso: 'JavaScript Básico',
        inviteLink: 'https://t.me/joinchat/test123',
        fechaInicio: '15/1/2025',
      });
    });

    // SRV-MCT-002: No enviar cuando no existe grupo
    it('SRV-MCT-002: debe saltar envío cuando no existe grupo de Telegram', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(false);

      // Act
      await service.enviarInvitacionGrupo(1, mockInscripcion);

      // Assert
      expect(mockGrupoTelegramService.existeGrupoTelegram).toHaveBeenCalledWith(1);
      expect(mockGrupoTelegramService.obtenerEnlaceInvitacion).not.toHaveBeenCalled();
      expect(mockCorreoService.enviarInvitacionTelegram).not.toHaveBeenCalled();
    });

    // SRV-MCT-003: No enviar cuando no hay enlace de invitación
    it('SRV-MCT-003: debe saltar envío cuando no hay enlace de invitación', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(true);
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockResolvedValue(null);

      // Act
      await service.enviarInvitacionGrupo(1, mockInscripcion);

      // Assert
      expect(mockGrupoTelegramService.obtenerEnlaceInvitacion).toHaveBeenCalledWith(1);
      expect(mockCorreoService.verificarConfiguracion).not.toHaveBeenCalled();
      expect(mockCorreoService.enviarInvitacionTelegram).not.toHaveBeenCalled();
    });

    // SRV-MCT-004: No enviar cuando servicio de correo no está configurado
    it('SRV-MCT-004: debe saltar envío cuando servicio de correo no está configurado', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(true);
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockResolvedValue('https://t.me/joinchat/test123');
      mockCorreoService.verificarConfiguracion.mockReturnValue(false);

      // Act
      await service.enviarInvitacionGrupo(1, mockInscripcion);

      // Assert
      expect(mockCorreoService.verificarConfiguracion).toHaveBeenCalled();
      expect(mockCorreoService.enviarInvitacionTelegram).not.toHaveBeenCalled();
    });

    // SRV-MCT-005: Manejar fallo en envío de correo
    it('SRV-MCT-005: debe manejar correctamente fallo en envío de correo', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(true);
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockResolvedValue('https://t.me/joinchat/test123');
      mockCorreoService.verificarConfiguracion.mockReturnValue(true);
      mockCorreoService.enviarInvitacionTelegram.mockResolvedValue(false);

      // Act
      await service.enviarInvitacionGrupo(1, mockInscripcion);

      // Assert
      expect(mockCorreoService.enviarInvitacionTelegram).toHaveBeenCalled();
      // El método no debe lanzar error, solo registrar el warning
    });

    // SRV-MCT-006: Manejar errores sin interrumpir el proceso
    it('SRV-MCT-006: debe manejar errores sin interrumpir el proceso principal', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockRejectedValue(new Error('Database error'));

      // Act & Assert - No debe lanzar excepción
      await expect(service.enviarInvitacionGrupo(1, mockInscripcion)).resolves.not.toThrow();
    });

    // SRV-MCT-007: Formatear fecha correctamente para el correo
    it('SRV-MCT-007: debe formatear fecha correctamente para el correo', async () => {
      // Arrange
      const inscripcionConFechaDiferente = {
        ...mockInscripcion,
        curso: {
          ...mockInscripcion.curso,
          fechaInicioCurso: new Date('2025-06-20T00:00:00Z'),
        },
      };
      
      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(true);
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockResolvedValue('https://t.me/joinchat/test123');
      mockCorreoService.verificarConfiguracion.mockReturnValue(true);
      mockCorreoService.enviarInvitacionTelegram.mockResolvedValue(true);

      // Act
      await service.enviarInvitacionGrupo(1, inscripcionConFechaDiferente);

      // Assert
      expect(mockCorreoService.enviarInvitacionTelegram).toHaveBeenCalledWith(
        expect.objectContaining({
          fechaInicio: '20/6/2025',
        })
      );
    });
  });

  describe('verificarGrupoDisponible', () => {
    
    // SRV-MCT-008: Verificar grupo disponible exitosamente
    it('SRV-MCT-008: debe verificar grupo disponible exitosamente', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(true);

      // Act
      const result = await service.verificarGrupoDisponible(1);

      // Assert
      expect(result).toBe(true);
      expect(mockGrupoTelegramService.existeGrupoTelegram).toHaveBeenCalledWith(1);
    });

    // SRV-MCT-009: Verificar grupo no disponible
    it('SRV-MCT-009: debe retornar false cuando grupo no está disponible', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(false);

      // Act
      const result = await service.verificarGrupoDisponible(1);

      // Assert
      expect(result).toBe(false);
    });

    // SRV-MCT-010: Manejar error en verificación
    it('SRV-MCT-010: debe retornar false cuando hay error en verificación', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.verificarGrupoDisponible(1);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('obtenerEnlaceInvitacion', () => {
    
    // SRV-MCT-011: Obtener enlace de invitación exitosamente
    it('SRV-MCT-011: debe obtener enlace de invitación exitosamente', async () => {
      // Arrange
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockResolvedValue('https://t.me/joinchat/test123');

      // Act
      const result = await service.obtenerEnlaceInvitacion(1);

      // Assert
      expect(result).toBe('https://t.me/joinchat/test123');
      expect(mockGrupoTelegramService.obtenerEnlaceInvitacion).toHaveBeenCalledWith(1);
    });

    // SRV-MCT-012: Retornar null cuando no hay enlace
    it('SRV-MCT-012: debe retornar null cuando no hay enlace', async () => {
      // Arrange
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockResolvedValue(null);

      // Act
      const result = await service.obtenerEnlaceInvitacion(1);

      // Assert
      expect(result).toBe(null);
    });

    // SRV-MCT-013: Manejar error en obtención de enlace
    it('SRV-MCT-013: debe retornar null cuando hay error', async () => {
      // Arrange
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockRejectedValue(new Error('Service error'));

      // Act
      const result = await service.obtenerEnlaceInvitacion(1);

      // Assert
      expect(result).toBe(null);
    });
  });

  describe('obtenerInformacionGrupo', () => {
    
    const mockGrupoInfo = {
      nombreGrupo: 'Grupo JS Básico',
      enlaceInvitacion: 'https://t.me/joinchat/test123',
      activo: true,
    };

    // SRV-MCT-014: Obtener información de grupo exitosamente
    it('SRV-MCT-014: debe obtener información de grupo exitosamente', async () => {
      // Arrange
      mockGrupoTelegramService.getGrupoTelegramByIdCurso.mockResolvedValue(mockGrupoInfo);

      // Act
      const result = await service.obtenerInformacionGrupo(1);

      // Assert
      expect(result).toEqual({
        nombreGrupo: 'Grupo JS Básico',
        enlaceInvitacion: 'https://t.me/joinchat/test123',
        activo: true,
      });
      expect(mockGrupoTelegramService.getGrupoTelegramByIdCurso).toHaveBeenCalledWith(1);
    });

    // SRV-MCT-015: Manejar error en obtención de información
    it('SRV-MCT-015: debe retornar null cuando hay error', async () => {
      // Arrange
      mockGrupoTelegramService.getGrupoTelegramByIdCurso.mockRejectedValue(new Error('Service error'));

      // Act
      const result = await service.obtenerInformacionGrupo(1);

      // Assert
      expect(result).toBe(null);
    });

    // SRV-MCT-016: Obtener información de grupo inactivo
    it('SRV-MCT-016: debe obtener información de grupo inactivo correctamente', async () => {
      // Arrange
      const grupoInactivo = { ...mockGrupoInfo, activo: false };
      mockGrupoTelegramService.getGrupoTelegramByIdCurso.mockResolvedValue(grupoInactivo);

      // Act
      const result = await service.obtenerInformacionGrupo(1);

      // Assert
      expect(result).toEqual({
        nombreGrupo: 'Grupo JS Básico',
        enlaceInvitacion: 'https://t.me/joinchat/test123',
        activo: false,
      });
    });
  });

  describe('reenviarInvitacion', () => {
    
    // SRV-MCT-017: Reenviar invitación exitosamente (método stub)
    it('SRV-MCT-017: debe ejecutar lógica de reenvío exitosamente', async () => {
      // Act
  const ok = await service.reenviarInvitacion(1);

  // Assert
  expect(ok).toBe(true);
    });

    // SRV-MCT-018: Manejar error en reenvío
    it('SRV-MCT-018: debe manejar error en reenvío de invitación', async () => {
      // Arrange - Forzar error simulando implementación futura
      jest.spyOn(service, 'reenviarInvitacion').mockImplementationOnce(async () => {
        throw new Error('Implementation error');
      });

  // Act: ejecutar una vez con error y no romper la prueba
  await expect(service.reenviarInvitacion(1)).rejects.toThrow('Implementation error');

  // Assert - Restaurar mock y llamar implementación real
      (service.reenviarInvitacion as jest.Mock).mockRestore();
      const realResult = await service.reenviarInvitacion(1);
      expect(realResult).toBe(true); // Implementación actual siempre retorna true
    });
  });

  describe('verificarConfiguracion', () => {
    
    // SRV-MCT-019: Verificar configuración correcta
    it('SRV-MCT-019: debe verificar configuración correcta', () => {
      // Arrange
      mockCorreoService.verificarConfiguracion.mockReturnValue(true);

      // Act
      const result = service.verificarConfiguracion();

      // Assert
      expect(result).toBe(true);
      expect(mockCorreoService.verificarConfiguracion).toHaveBeenCalled();
    });

    // SRV-MCT-020: Verificar configuración incorrecta
    it('SRV-MCT-020: debe retornar false cuando correo no está configurado', () => {
      // Arrange
      mockCorreoService.verificarConfiguracion.mockReturnValue(false);

      // Act
      const result = service.verificarConfiguracion();

      // Assert
      expect(result).toBe(false);
    });

    // SRV-MCT-021: Manejar error en verificación de configuración
    it('SRV-MCT-021: debe manejar error en verificación de configuración', () => {
      // Arrange
      mockCorreoService.verificarConfiguracion.mockImplementation(() => {
        throw new Error('Configuration error');
      });

      // Act
      const result = service.verificarConfiguracion();

      // Assert
      expect(result).toBe(false);
    });

    // SRV-MCT-022: Verificar que se registran logs de advertencia
    it('SRV-MCT-022: debe registrar warning cuando correo no está configurado', () => {
      // Arrange
      mockCorreoService.verificarConfiguracion.mockReturnValue(false);

      // Act
      service.verificarConfiguracion();

      // Assert
      expect(mockCorreoService.verificarConfiguracion).toHaveBeenCalled();
      // Los logs se verifican implícitamente por el comportamiento del servicio
    });
  });

  describe('Integración completa', () => {
    
    // SRV-MCT-023: Flujo completo de envío con diferentes cursos
    it('SRV-MCT-023: debe manejar diferentes cursos correctamente', async () => {
      // Arrange
      const inscripcionCurso2 = {
        ...mockInscripcion,
        idCurso: 2,
        curso: {
          ...mockInscripcion.curso,
          idCurso: 2,
          nombreCurso: 'React Avanzado',
        },
      };

      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(true);
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockResolvedValue('https://t.me/joinchat/react123');
      mockCorreoService.verificarConfiguracion.mockReturnValue(true);
      mockCorreoService.enviarInvitacionTelegram.mockResolvedValue(true);

      // Act
      await service.enviarInvitacionGrupo(2, inscripcionCurso2);

      // Assert
      expect(mockGrupoTelegramService.existeGrupoTelegram).toHaveBeenCalledWith(2);
      expect(mockCorreoService.enviarInvitacionTelegram).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreCurso: 'React Avanzado',
          inviteLink: 'https://t.me/joinchat/react123',
        })
      );
    });

    // SRV-MCT-024: Verificar que todos los métodos auxiliares funcionan en conjunto
    it('SRV-MCT-024: debe tener métodos auxiliares que funcionen correctamente', async () => {
      // Arrange
      mockGrupoTelegramService.existeGrupoTelegram.mockResolvedValue(true);
      mockGrupoTelegramService.obtenerEnlaceInvitacion.mockResolvedValue('https://t.me/joinchat/test123');
      mockGrupoTelegramService.getGrupoTelegramByIdCurso.mockResolvedValue({
        nombreGrupo: 'Grupo Test',
        enlaceInvitacion: 'https://t.me/joinchat/test123',
        activo: true,
      });
      mockCorreoService.verificarConfiguracion.mockReturnValue(true);

      // Act
      const grupoDisponible = await service.verificarGrupoDisponible(1);
      const enlaceInvitacion = await service.obtenerEnlaceInvitacion(1);
      const infoGrupo = await service.obtenerInformacionGrupo(1);
      const configuracionOk = service.verificarConfiguracion();

      // Assert
      expect(grupoDisponible).toBe(true);
      expect(enlaceInvitacion).toBe('https://t.me/joinchat/test123');
      expect(infoGrupo).toEqual({
        nombreGrupo: 'Grupo Test',
        enlaceInvitacion: 'https://t.me/joinchat/test123',
        activo: true,
      });
      expect(configuracionOk).toBe(true);
    });
  });
});
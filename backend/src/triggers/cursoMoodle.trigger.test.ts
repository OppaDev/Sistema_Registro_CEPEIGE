import { CursoMoodleTrigger, cursoMoodleTrigger } from './cursoMoodle.trigger';
import { Curso } from '@prisma/client';
import { logger } from '@/utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

// Mock del logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('CursoMoodleTrigger', () => {
  let trigger: CursoMoodleTrigger;

  const mockCurso: Curso = {
    idCurso: 1,
    nombreCortoCurso: 'JS101',
    nombreCurso: 'Curso de JavaScript',
    modalidadCurso: 'Virtual',
    valorCurso: new Decimal(150.00),
    fechaInicioCurso: new Date('2025-02-01'),
    fechaFinCurso: new Date('2025-02-28'),
    descripcionCurso: 'Curso completo de JavaScript'
  };

  beforeEach(() => {
    trigger = new CursoMoodleTrigger();
    jest.clearAllMocks();
  });

  describe('Instancia Singleton', () => {
    // TRG-CM-017: Verificar que cursoMoodleTrigger es una instancia
    it('TRG-CM-017: debe exportar una instancia singleton', () => {
      expect(cursoMoodleTrigger).toBeInstanceOf(CursoMoodleTrigger);
    });

    // TRG-CM-018: Verificar que la instancia tiene todos los métodos
    it('TRG-CM-018: debe tener todos los métodos públicos', () => {
      expect(typeof cursoMoodleTrigger.ejecutarPostCreacion).toBe('function');
      expect(typeof cursoMoodleTrigger.ejecutarPostActualizacion).toBe('function');
      expect(typeof cursoMoodleTrigger.ejecutarPreEliminacion).toBe('function');
      expect(typeof cursoMoodleTrigger.verificarSincronizacionMoodle).toBe('function');
      expect(typeof cursoMoodleTrigger.obtenerMoodleCourseId).toBe('function');
    });
  });

  describe('ejecutarPostActualizacion', () => {
    // TRG-CM-005: Ejecutar post-actualización exitosamente
    it('TRG-CM-005: debe ejecutar post-actualización exitosamente', async () => {
      // Act
      await trigger.ejecutarPostActualizacion(mockCurso);

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Trigger post-actualización activado para curso ID 1')
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Trigger post-actualización completado para curso ID 1')
      );
    });
  });

  describe('Casos Edge', () => {
    // TRG-CM-019: Verificar que los métodos están definidos
    it('TRG-CM-019: debe tener todos los métodos definidos', () => {
      expect(trigger.ejecutarPostCreacion).toBeDefined();
      expect(trigger.ejecutarPostActualizacion).toBeDefined();
      expect(trigger.ejecutarPreEliminacion).toBeDefined();
      expect(trigger.verificarSincronizacionMoodle).toBeDefined();
      expect(trigger.obtenerMoodleCourseId).toBeDefined();
    });

    // TRG-CM-020: Verificar que el trigger se puede instanciar
    it('TRG-CM-020: debe poder instanciar el trigger', () => {
      const newTrigger = new CursoMoodleTrigger();
      expect(newTrigger).toBeInstanceOf(CursoMoodleTrigger);
    });
  });
});

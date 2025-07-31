import { PrismaClient, Curso } from "@prisma/client";
import { cursoMoodleService } from "@/api/services/moodleService/cursoMoodle.service";
import { CursoMoodleService } from "@/api/services/integrationService/cursoMoodle.service";
import { AppError } from "@/utils/errorTypes";
import { logger } from "@/utils/logger";

const prisma = new PrismaClient();
const cursoMoodleServicePersistence = new CursoMoodleService();

/**
 * Trigger para manejar eventos relacionados con cursos y Moodle
 * Maneja la sincronización automática entre el sistema y Moodle
 */
export class CursoMoodleTrigger {
  
  /**
   * Ejecutar acciones post-creación de curso
   * @param curso - Curso recién creado
   * @returns Promise<void>
   * @throws AppError si falla la creación en Moodle
   */
  async ejecutarPostCreacion(curso: Curso): Promise<void> {
    try {
      logger.info(`Trigger post-creación activado para curso ID ${curso.idCurso}`);
      
      // Crear curso en Moodle
      const moodleCourseId = await cursoMoodleService.crearCursoEnMoodle(curso);
      
      // Guardar información del curso en la base de datos de persistencia
      await this.guardarCursoMoodle(curso.idCurso, moodleCourseId, curso.nombreCortoCurso);
      
      logger.info(`Curso creado exitosamente en Moodle y guardado en BD`, {
        cursoId: curso.idCurso,
        nombreCortoCurso: curso.nombreCortoCurso,
        moodleCourseId
      });

    } catch (moodleError) {
      logger.error(`Error en trigger post-creación de curso`, {
        cursoId: curso.idCurso,
        nombreCortoCurso: curso.nombreCortoCurso,
        error: moodleError instanceof Error ? moodleError.message : 'Error desconocido'
      });

      // Realizar rollback: eliminar el curso de la base de datos
      await this.rollbackCursoCreation(curso.idCurso);

      // Lanzar error informativo
      throw new AppError(
        `Error al crear curso en Moodle: ${moodleError instanceof Error ? moodleError.message : 'Error desconocido'}. El curso no fue creado.`,
        500
      );
    }
  }

  /**
   * Ejecutar acciones post-actualización de curso
   * @param curso - Curso actualizado
   * @returns Promise<void>
   */
  async ejecutarPostActualizacion(curso: Curso): Promise<void> {
    try {
      logger.info(`Trigger post-actualización activado para curso ID ${curso.idCurso}`);
      
      // Aquí se pueden agregar acciones como:
      // - Actualizar curso en Moodle
      // - Notificar a estudiantes matriculados
      // - Sincronizar con otros sistemas
      
      logger.info(`Trigger post-actualización completado para curso ID ${curso.idCurso}`);
      
    } catch (error) {
      logger.error(`Error en trigger post-actualización de curso ${curso.idCurso}:`, {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // En actualizaciones, no hacemos rollback completo
      // Solo registramos el error para monitoreo
    }
  }

  /**
   * Ejecutar acciones pre-eliminación de curso
   * @param cursoId - ID del curso a eliminar
   * @returns Promise<void>
   */
  async ejecutarPreEliminacion(cursoId: number): Promise<void> {
    try {
      logger.info(`Trigger pre-eliminación activado para curso ID ${cursoId}`);
      
      // Verificar si existe integración con Moodle
      const existeIntegracion = await cursoMoodleServicePersistence.existeIntegracionMoodle(cursoId);
      
      if (existeIntegracion) {
        // Eliminar registro de la integración Moodle
        await cursoMoodleServicePersistence.deleteCursoMoodle(cursoId);
        logger.info(`Integración Moodle eliminada para curso ${cursoId}`);
        
        // TODO: Aquí se podría eliminar también el curso de Moodle si es necesario
        // const moodleCourseId = await this.obtenerMoodleCourseId(cursoId);
        // if (moodleCourseId) {
        //   await cursoMoodleService.eliminarCursoEnMoodle(moodleCourseId);
        // }
      }
      
      logger.info(`Trigger pre-eliminación completado para curso ID ${cursoId}`);
      
    } catch (error) {
      logger.error(`Error en trigger pre-eliminación de curso ${cursoId}:`, {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // En eliminaciones, podemos permitir que continúe o bloquear según el caso
      // Para integraciones, no bloqueamos la eliminación del curso principal
      logger.warn(`Eliminando curso ${cursoId} a pesar del error en Moodle: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Realizar rollback de creación de curso
   * @param cursoId - ID del curso a eliminar
   * @returns Promise<void>
   */
  private async rollbackCursoCreation(cursoId: number): Promise<void> {
    try {
      logger.info(`Iniciando rollback para curso ID ${cursoId}`);
      
      await prisma.curso.delete({
        where: { idCurso: cursoId }
      });
      
      logger.info(`Rollback completado para curso ID ${cursoId}`);
      
    } catch (rollbackError) {
      logger.error(`Error crítico en rollback de curso ${cursoId}:`, {
        error: rollbackError instanceof Error ? rollbackError.message : 'Error desconocido'
      });
      
      // Este es un error crítico que requiere intervención manual
      throw new AppError(
        `Error crítico en rollback del curso ${cursoId}. Se requiere intervención manual.`,
        500
      );
    }
  }

  /**
   * Guardar información del curso Moodle en la base de datos
   * @param cursoId - ID del curso
   * @param moodleCourseId - ID del curso en Moodle
   * @param nombreCortoMoodle - Nombre corto en Moodle
   * @returns Promise<void>
   */
  private async guardarCursoMoodle(cursoId: number, moodleCourseId: number, nombreCortoMoodle: string): Promise<void> {
    try {
      await cursoMoodleServicePersistence.createCursoMoodle({
        idCurso: cursoId,
        moodleCursoId: moodleCourseId,
        nombreCortoMoodle: nombreCortoMoodle,
        activo: true
      });

      logger.info(`Información del curso Moodle guardada en BD`, {
        cursoId,
        moodleCourseId,
        nombreCortoMoodle
      });

    } catch (error) {
      logger.error(`Error al guardar información del curso Moodle:`, {
        cursoId,
        moodleCourseId,
        nombreCortoMoodle,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // Lanzamos error para que se ejecute el rollback
      throw error;
    }
  }

  /**
   * Verificar estado de sincronización con Moodle
   * @param curso - Curso a verificar
   * @returns Promise<boolean> - true si está sincronizado
   */
  async verificarSincronizacionMoodle(curso: Curso): Promise<boolean> {
    try {
      // Primero verificar en nuestra BD de persistencia
      const existeEnBD = await cursoMoodleServicePersistence.existeIntegracionMoodle(curso.idCurso);
      
      if (existeEnBD) {
        return true;
      }

      // Si no está en BD, verificar directamente en Moodle
      const moodleCourseId = await cursoMoodleService.obtenerMoodleCourseIdPorShortname(
        curso.nombreCortoCurso
      );
      
      return moodleCourseId !== null;
      
    } catch (error) {
      logger.error(`Error al verificar sincronización con Moodle para curso ${curso.idCurso}:`, {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      return false;
    }
  }

  /**
   * Obtener ID de curso en Moodle desde la BD de persistencia
   * @param cursoId - ID del curso
   * @returns Promise<number | null> - ID del curso en Moodle o null
   */
  async obtenerMoodleCourseId(cursoId: number): Promise<number | null> {
    try {
      return await cursoMoodleServicePersistence.obtenerMoodleCursoId(cursoId);
    } catch (error) {
      logger.error(`Error al obtener ID de curso Moodle para curso ${cursoId}:`, error);
      return null;
    }
  }
}

// Exportar instancia única del trigger
export const cursoMoodleTrigger = new CursoMoodleTrigger();
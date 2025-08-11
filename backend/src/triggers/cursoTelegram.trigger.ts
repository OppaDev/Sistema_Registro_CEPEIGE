import { Curso } from "@prisma/client";
import { grupoCursoTelegramService } from "@/api/services/telegramService/grupoCursoTelegram.service";
import { GrupoTelegramService } from "@/api/services/integrationService/grupoTelegram.service";
import { logger } from "@/utils/logger";

interface TelegramGroupInfo {
  groupId: number;
  groupTitle: string;
  inviteLink: string;
}

const grupoTelegramService = new GrupoTelegramService();

export class CursoTelegramTrigger {
  
  async ejecutarPostCreacion(curso: Curso): Promise<void> {
    try {
      logger.info(`Trigger Telegram post-creación activado para curso ID ${curso.idCurso}`);
      
      // Verificar si Telegram está configurado
      const telegramConfigured = await grupoCursoTelegramService.verificarConexion();
      
      if (!telegramConfigured) {
        logger.warn(`Telegram no está configurado correctamente. Saltando creación de grupo para curso ${curso.idCurso}`);
        return;
      }

      // Crear grupo de Telegram para el curso
      const groupInfo = await grupoCursoTelegramService.crearGrupoParaCurso(curso);
      
      logger.info('Grupo de Telegram creado exitosamente', {
        cursoId: curso.idCurso,
        nombreCortoCurso: curso.nombreCortoCurso,
        groupId: groupInfo.groupId,
        groupTitle: groupInfo.groupTitle,
        inviteLink: groupInfo.inviteLink
      });

      // Guardar información del grupo en la base de datos
      await this.guardarInfoGrupoTelegram(curso.idCurso, groupInfo);

    } catch (telegramError) {
      logger.error(`Error en trigger Telegram post-creación de curso`, {
        cursoId: curso.idCurso,
        nombreCortoCurso: curso.nombreCortoCurso,
        error: telegramError instanceof Error ? telegramError.message : 'Error desconocido'
      });

      // A diferencia del trigger de Moodle, no hacemos rollback del curso
      // porque el grupo de Telegram es opcional y no crítico para el funcionamiento del curso
      logger.warn(`Curso ${curso.idCurso} creado sin grupo de Telegram debido a error: ${telegramError instanceof Error ? telegramError.message : 'Error desconocido'}`);
    }
  }

  async ejecutarPostActualizacion(curso: Curso): Promise<void> {
    try {
      logger.info(`Trigger Telegram post-actualización activado para curso ID ${curso.idCurso}`);
      
      // Verificar si existe un grupo de Telegram para este curso
      const groupInfo = await this.obtenerInfoGrupoTelegram(curso.idCurso);
      
      if (!groupInfo) {
        logger.info(`No hay grupo de Telegram asociado al curso ${curso.idCurso}. Saltando actualización.`);
        return;
      }

      // Aquí se pueden agregar acciones como:
      // - Actualizar descripción del grupo
      // - Notificar cambios a los miembros
      // - Actualizar título del grupo si cambió el nombre del curso
      
      logger.info(`Trigger Telegram post-actualización completado para curso ID ${curso.idCurso}`);
      
    } catch (error) {
      logger.error(`Error en trigger Telegram post-actualización de curso ${curso.idCurso}:`, {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // En actualizaciones, no bloqueamos la operación
      // Solo registramos el error para monitoreo
    }
  }

  async ejecutarPreEliminacion(cursoId: number): Promise<void> {
    try {
      logger.info(`Trigger Telegram pre-eliminación activado para curso ID ${cursoId}`);
      
      // Obtener información del grupo de Telegram
      const groupInfo = await this.obtenerInfoGrupoTelegram(cursoId);
      
      if (groupInfo) {
        // Eliminar o archivar el grupo de Telegram
        await grupoCursoTelegramService.eliminarGrupo(groupInfo.groupId);
        
        // Limpiar información del grupo de la base de datos
        await this.limpiarInfoGrupoTelegram(cursoId);
        
        logger.info(`Grupo de Telegram eliminado para curso ID ${cursoId}`);
      } else {
        logger.info(`No hay grupo de Telegram asociado al curso ${cursoId}`);
      }
      
    } catch (error) {
      logger.error(`Error en trigger Telegram pre-eliminación de curso ${cursoId}:`, {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // No bloqueamos la eliminación del curso por errores de Telegram
      logger.warn(`Eliminando curso ${cursoId} a pesar del error en Telegram: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async guardarInfoGrupoTelegram(cursoId: number, groupInfo: TelegramGroupInfo): Promise<void> {
    try {
      await grupoTelegramService.createGrupoTelegram({
        idCurso: cursoId,
        telegramGroupId: groupInfo.groupId.toString(),
        nombreGrupo: groupInfo.groupTitle,
        enlaceInvitacion: groupInfo.inviteLink,
        activo: true
      });

      logger.info(`Información del grupo de Telegram guardada en BD:`, {
        cursoId,
        groupId: groupInfo.groupId,
        groupTitle: groupInfo.groupTitle,
        inviteLink: groupInfo.inviteLink
      });

    } catch (error) {
      logger.error(`Error al guardar información del grupo de Telegram:`, error);
      throw error;
    }
  }

  private async obtenerInfoGrupoTelegram(cursoId: number): Promise<TelegramGroupInfo | null> {
    try {
      const grupoTelegram = await grupoTelegramService.getGrupoTelegramByIdCurso(cursoId);
      
      if (grupoTelegram) {
        return {
          groupId: parseInt(grupoTelegram.telegramGroupId),
          groupTitle: grupoTelegram.nombreGrupo,
          inviteLink: grupoTelegram.enlaceInvitacion
        };
      }

      return null;

    } catch (error) {
      // Si no existe, no es un error crítico
      if (error instanceof Error && error.message.includes('not found')) {
        logger.debug(`No se encontró grupo de Telegram para curso ${cursoId}`);
        return null;
      }
      
      logger.error(`Error al obtener información del grupo de Telegram:`, error);
      return null;
    }
  }

  private async limpiarInfoGrupoTelegram(cursoId: number): Promise<void> {
    try {
      await grupoTelegramService.deleteGrupoTelegram(cursoId);
      logger.info(`Información del grupo de Telegram eliminada de BD para curso ${cursoId}`);

    } catch (error) {
      // Si no existe, no es un error crítico
      if (error instanceof Error && error.message.includes('not found')) {
        logger.debug(`No había información de grupo de Telegram para limpiar en curso ${cursoId}`);
        return;
      }
      
      logger.error(`Error al limpiar información del grupo de Telegram:`, error);
      throw error;
    }
  }

  async verificarGrupoActivo(cursoId: number): Promise<boolean> {
    try {
      const groupInfo = await this.obtenerInfoGrupoTelegram(cursoId);
      
      if (!groupInfo) {
        return false;
      }

      // Verificar si el grupo aún existe en Telegram
      const groupExists = await grupoCursoTelegramService.obtenerInfoGrupo(groupInfo.groupId);
      
      return groupExists !== null;

    } catch (error) {
      logger.error(`Error al verificar grupo activo para curso ${cursoId}:`, error);
      return false;
    }
  }

  async obtenerEnlaceInvitacion(cursoId: number): Promise<string | null> {
    try {
      // Primero intentar obtener desde la BD
      const enlaceInvitacion = await grupoTelegramService.obtenerEnlaceInvitacion(cursoId);
      
      if (enlaceInvitacion) {
        return enlaceInvitacion;
      }

      logger.info(`No hay grupo de Telegram para curso ${cursoId}`);
      return null;

    } catch (error) {
      logger.error(`Error al obtener enlace de invitación para curso ${cursoId}:`, error);
      return null;
    }
  }
}

export const cursoTelegramTrigger = new CursoTelegramTrigger();
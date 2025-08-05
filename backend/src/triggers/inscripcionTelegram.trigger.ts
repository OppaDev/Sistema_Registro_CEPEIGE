import { miembroCursoTelegramService } from "@/api/services/telegramService/miembroCursoTelegram.service";
import { logger } from "@/utils/logger";
import type { PrismaInscripcionAdminConRelaciones } from "@/api/services/mappers/inscripcionMapper/inscripcion.mapper";

/**
 * Trigger para manejar eventos relacionados con inscripciones y Telegram
 * Maneja el envío automático de invitaciones a grupos de Telegram
 */
export class InscripcionTelegramTrigger {

  /**
   * Ejecutar trigger de invitación a Telegram cuando se activa la matrícula
   * @param inscripcionId - ID de la inscripción
   * @param inscripcionData - Datos de la inscripción con relaciones
   * @returns Promise<void>
   */
  async ejecutarInvitacionTelegram(inscripcionId: number, inscripcionData: PrismaInscripcionAdminConRelaciones): Promise<void> {
    try {
      logger.info(`Trigger Telegram activado: Procesando invitación para inscripción ${inscripcionId}`);
      
      // Verificar que el servicio esté configurado
      if (!miembroCursoTelegramService.verificarConfiguracion()) {
        logger.warn(`Servicio de Telegram no configurado correctamente. Saltando invitación para inscripción ${inscripcionId}`);
        return;
      }

      // Verificar que exista un grupo para el curso
      const grupoDisponible = await miembroCursoTelegramService.verificarGrupoDisponible(inscripcionData.idCurso);
      
      if (!grupoDisponible) {
        logger.info(`No hay grupo de Telegram disponible para el curso ${inscripcionData.idCurso}. Saltando invitación.`);
        return;
      }

      // Enviar invitación por correo
      await miembroCursoTelegramService.enviarInvitacionGrupo(inscripcionId, inscripcionData);

      logger.info(`Trigger Telegram completado exitosamente para inscripción ${inscripcionId}`, {
        inscripcionId,
        email: inscripcionData.persona.correo,
        cursoId: inscripcionData.idCurso,
        nombreCurso: inscripcionData.curso.nombreCortoCurso
      });

    } catch (telegramError) {
      // A diferencia del trigger de Moodle, no revertimos la matrícula por errores de Telegram
      // porque es un servicio opcional y no crítico
      logger.error(`Error en trigger Telegram para inscripción ${inscripcionId}`, {
        inscripcionId,
        email: inscripcionData.persona.correo,
        cursoId: inscripcionData.idCurso,
        error: telegramError instanceof Error ? telegramError.message : 'Error desconocido'
      });

      // Solo registramos el error, no bloqueamos el proceso de matrícula
      logger.warn(`Matrícula ${inscripcionId} procesada sin invitación de Telegram debido a error: ${telegramError instanceof Error ? telegramError.message : 'Error desconocido'}`);
    }
  }

  /**
   * Reenviar invitación de Telegram para una inscripción específica
   * @param inscripcionId - ID de la inscripción
   * @param inscripcionData - Datos de la inscripción con relaciones
   * @returns Promise<boolean> - true si se reenvió exitosamente
   */
  async reenviarInvitacionTelegram(inscripcionId: number, inscripcionData: PrismaInscripcionAdminConRelaciones): Promise<boolean> {
    try {
      logger.info(`Reenviando invitación de Telegram para inscripción ${inscripcionId}`);

      // Verificar que la inscripción esté matriculada
      if (!inscripcionData.matricula) {
        logger.warn(`La inscripción ${inscripcionId} no está matriculada. No se puede reenviar invitación de Telegram.`);
        return false;
      }

      // Verificar configuración
      if (!miembroCursoTelegramService.verificarConfiguracion()) {
        logger.warn(`Servicio de Telegram no configurado correctamente. No se puede reenviar invitación.`);
        return false;
      }

      // Verificar grupo disponible
      const grupoDisponible = await miembroCursoTelegramService.verificarGrupoDisponible(inscripcionData.idCurso);
      
      if (!grupoDisponible) {
        logger.warn(`No hay grupo de Telegram disponible para el curso ${inscripcionData.idCurso}. No se puede reenviar invitación.`);
        return false;
      }

      // Reenviar invitación
      await miembroCursoTelegramService.enviarInvitacionGrupo(inscripcionId, inscripcionData);

      logger.info(`Invitación de Telegram reenviada exitosamente para inscripción ${inscripcionId}`, {
        inscripcionId,
        email: inscripcionData.persona.correo,
        cursoId: inscripcionData.idCurso
      });

      return true;

    } catch (error) {
      logger.error(`Error al reenviar invitación de Telegram para inscripción ${inscripcionId}:`, {
        inscripcionId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      return false;
    }
  }

  /**
   * Verificar disponibilidad de grupo de Telegram para un curso
   * @param cursoId - ID del curso
   * @returns Promise<boolean> - true si hay grupo disponible
   */
  async verificarGrupoDisponible(cursoId: number): Promise<boolean> {
    try {
      return await miembroCursoTelegramService.verificarGrupoDisponible(cursoId);
    } catch (error) {
      logger.error(`Error al verificar grupo de Telegram para curso ${cursoId}:`, error);
      return false;
    }
  }

  /**
   * Obtener información del grupo de Telegram para un curso
   * @param cursoId - ID del curso
   * @returns Promise<object | null> - Información del grupo o null
   */
  async obtenerInformacionGrupo(cursoId: number): Promise<{ nombreGrupo: string; enlaceInvitacion: string; activo: boolean } | null> {
    try {
      return await miembroCursoTelegramService.obtenerInformacionGrupo(cursoId);
    } catch (error) {
      logger.error(`Error al obtener información del grupo de Telegram para curso ${cursoId}:`, error);
      return null;
    }
  }

  /**
   * Verificar configuración del trigger
   * @returns boolean - true si está correctamente configurado
   */
  verificarConfiguracion(): boolean {
    try {
      return miembroCursoTelegramService.verificarConfiguracion();
    } catch (error) {
      logger.error('Error al verificar configuración del trigger de Telegram:', error);
      return false;
    }
  }
}

// Exportar instancia única del trigger
export const inscripcionTelegramTrigger = new InscripcionTelegramTrigger();
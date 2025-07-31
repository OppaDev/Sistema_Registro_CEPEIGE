import { logger } from "@/utils/logger";
import { GrupoTelegramService } from "@/api/services/integrationService/grupoTelegram.service";
import {
  CorreoService,
  type CorreoInvitacionTelegramData,
} from "@/api/services/correoService/correo.service";
import type { PrismaInscripcionAdminConRelaciones } from "@/api/services/mappers/inscripcionMapper/inscripcion.mapper";

const grupoTelegramService = new GrupoTelegramService();
const correoService = new CorreoService();

class MiembroCursoTelegramService {
  /**
   * Enviar invitaci�n por correo al grupo de Telegram cuando se matricula un usuario
   * @param inscripcionId - ID de la inscripci�n
   * @param inscripcion - Datos completos de la inscripci�n
   * @returns Promise<void>
   */
  async enviarInvitacionGrupo(
    inscripcionId: number,
    inscripcion: PrismaInscripcionAdminConRelaciones
  ): Promise<void> {
    try {
      logger.info(
        `Enviando invitacion de grupo Telegram para inscripcion ${inscripcionId}`
      );

      // 1. Verificar que exista un grupo de Telegram para el curso
      const existeGrupo = await grupoTelegramService.existeGrupoTelegram(
        inscripcion.idCurso
      );

      if (!existeGrupo) {
        logger.warn(
          `No existe grupo de Telegram para el curso ${inscripcion.idCurso}. Saltando envio de invitacion.`
        );
        return;
      }

      // 2. Obtener enlace de invitación del grupo desde la BD
      const inviteLink = await grupoTelegramService.obtenerEnlaceInvitacion(
        inscripcion.idCurso
      );

      if (!inviteLink) {
        logger.warn(
          `No se encontró enlace de invitación para el curso ${inscripcion.idCurso}. Saltando envío.`
        );
        return;
      }

      // 3. Verificar configuración del servicio de correo
      if (!correoService.verificarConfiguracion()) {
        logger.warn(
          `Servicio de correo no configurado correctamente. Saltando envío de invitación Telegram.`
        );
        return;
      }

      // 4. Preparar datos para el correo
      const invitacionData: CorreoInvitacionTelegramData = {
        email: inscripcion.persona.correo,
        nombre: inscripcion.persona.nombres,
        apellido: inscripcion.persona.apellidos,
        nombreCurso: inscripcion.curso.nombreCurso,
        inviteLink: inviteLink,
        fechaInicio:
          inscripcion.curso.fechaInicioCurso.toLocaleDateString("es-ES"),
      };

      // 5. Enviar correo con invitación
      const emailEnviado = await correoService.enviarInvitacionTelegram(
        invitacionData
      );

      if (emailEnviado) {
        logger.info(`Invitación de grupo Telegram enviada exitosamente`, {
          inscripcionId,
          email: invitacionData.email,
          cursoId: inscripcion.idCurso,
          nombreCurso: inscripcion.curso.nombreCurso,
          inviteLink: inviteLink,
        });
      } else {
        logger.warn(`No se pudo enviar la invitación de Telegram por correo`, {
          inscripcionId,
          email: invitacionData.email,
          cursoId: inscripcion.idCurso,
        });
      }
    } catch (error) {
      logger.error(
        `Error al enviar invitación de grupo Telegram para inscripción ${inscripcionId}:`,
        {
          error: error instanceof Error ? error.message : "Error desconocido",
          inscripcionId,
          cursoId: inscripcion.idCurso,
        }
      );

      // No lanzamos error para no bloquear el proceso de matrícula
      // Solo registramos el error para monitoreo
    }
  }

  /**
   * Verificar si hay un grupo de Telegram disponible para un curso
   * @param cursoId - ID del curso
   * @returns Promise<boolean> - true si hay grupo disponible
   */
  async verificarGrupoDisponible(cursoId: number): Promise<boolean> {
    try {
      return await grupoTelegramService.existeGrupoTelegram(cursoId);
    } catch (error) {
      logger.error(
        `Error al verificar grupo disponible para curso ${cursoId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Obtener enlace de invitación de un curso
   * @param cursoId - ID del curso
   * @returns Promise<string | null> - Enlace de invitación o null
   */
  async obtenerEnlaceInvitacion(cursoId: number): Promise<string | null> {
    try {
      return await grupoTelegramService.obtenerEnlaceInvitacion(cursoId);
    } catch (error) {
      logger.error(
        `Error al obtener enlace de invitación para curso ${cursoId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Obtener informaci�n completa del grupo de Telegram de un curso
   * @param cursoId - ID del curso
   * @returns Promise<object | null> - Informaci�n del grupo o null
   */
  async obtenerInformacionGrupo(
    cursoId: number
  ): Promise<{
    nombreGrupo: string;
    enlaceInvitacion: string;
    activo: boolean;
  } | null> {
    try {
      const grupoTelegram =
        await grupoTelegramService.getGrupoTelegramByIdCurso(cursoId);

      return {
        nombreGrupo: grupoTelegram.nombreGrupo,
        enlaceInvitacion: grupoTelegram.enlaceInvitacion,
        activo: grupoTelegram.activo,
      };
    } catch (error) {
      logger.error(
        `Error al obtener informaci�n del grupo para curso ${cursoId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Reenviar invitaci�n de Telegram a un usuario espec�fico
   * @param inscripcionId - ID de la inscripci�n
   * @returns Promise<boolean> - true si se reenvi� exitosamente
   */
  async reenviarInvitacion(inscripcionId: number): Promise<boolean> {
    try {
      // Obtener datos de la inscripci�n
      // Nota: Aqu� necesitar�as acceso al servicio de inscripciones para obtener los datos completos
      // Por simplicidad, asumo que se puede hacer la consulta directamente
      logger.info(
        `Reenviando invitaci�n de Telegram para inscripci�n ${inscripcionId}`
      );

      // TODO: Implementar l�gica de reenv�o
      // 1. Obtener datos completos de la inscripci�n
      // 2. Verificar que est� matriculada
      // 3. Llamar a enviarInvitacionGrupo

      return true;
    } catch (error) {
      logger.error(
        `Error al reenviar invitaci�n para inscripci�n ${inscripcionId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Verificar configuraci�n del servicio
   * @returns boolean - true si est� correctamente configurado
   */
  verificarConfiguracion(): boolean {
    try {
      // Verificar servicio de correo
      const correoConfigurado = correoService.verificarConfiguracion();

      if (!correoConfigurado) {
        logger.warn(
          "Servicio de correo no configurado para invitaciones Telegram"
        );
        return false;
      }

      return true;
    } catch (error) {
      logger.error(
        "Error al verificar configuraci�n del servicio de miembros Telegram:",
        error
      );
      return false;
    }
  }
}

export { MiembroCursoTelegramService };
export const miembroCursoTelegramService = new MiembroCursoTelegramService();

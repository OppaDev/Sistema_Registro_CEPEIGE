// src/api/services/moodleService/matriculaMoodle.service.ts

import moodleClient from '@/config/moodleClient';
import { AppError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';

/**
 * Interfaz para la respuesta de Moodle al matricular
 */
interface MoodleEnrolmentResponse {
  warnings?: Array<{
    item: string;
    itemid: number;
    warningcode: string;
    message: string;
  }>;
}

/**
 * Servicio para gestionar matrículas/inscripciones en Moodle
 */
export class MatriculaMoodleService {
  private readonly DEFAULT_ROLE_ID = 5; // Role ID por defecto en Moodle (student = 5)

  /**
   * Matricular un usuario en un curso de Moodle
   * @param moodleUserId - ID del usuario en Moodle
   * @param moodleCourseId - ID del curso en Moodle
   * @param startDate - Fecha de inicio del curso (opcional)
   * @param endDate - Fecha de fin del curso (opcional)
   * @returns Promise<boolean> - true si fue exitoso
   */
  async matricularUsuarioEnCurso(
    moodleUserId: number, 
    moodleCourseId: number, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<boolean> {
    try {
      logger.info(`Iniciando matrícula en Moodle: Usuario ${moodleUserId} en Curso ${moodleCourseId}`);

  // Preparar datos y logs
  const formData = this.construirFormDataMatricula(moodleUserId, moodleCourseId, startDate, endDate);
  this.logDatosMatricula(moodleUserId, moodleCourseId, startDate, endDate, formData);

      // Llamar a la API de Moodle
      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

  // Validar respuesta
  this.validarRespuestaMatricula(response);

      logger.info(`Usuario matriculado exitosamente en Moodle`, {
        moodleUserId,
        moodleCourseId,
        roleid: this.DEFAULT_ROLE_ID
      });

      return true;

    } catch (error) {
      logger.error('Error al matricular usuario en curso de Moodle:', {
        moodleUserId,
        moodleCourseId,
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      });

      // Re-lanzar como AppError para manejo consistente
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        `Error al matricular usuario en Moodle: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        500
      );
    }
  }

  // Helpers extraídos para reducir complejidad
  private construirFormDataMatricula(
    moodleUserId: number,
    moodleCourseId: number,
    startDate?: Date,
    endDate?: Date
  ): URLSearchParams {
    const formData = new URLSearchParams();
    formData.append('wsfunction', 'enrol_manual_enrol_users');
    formData.append('enrolments[0][roleid]', this.DEFAULT_ROLE_ID.toString());
    formData.append('enrolments[0][userid]', moodleUserId.toString());
    formData.append('enrolments[0][courseid]', moodleCourseId.toString());
    formData.append('enrolments[0][suspend]', '0');
    // Usar fecha actual para que esté activo inmediatamente al matricularse
    const timestart = Math.floor(Date.now() / 1000);
    formData.append('enrolments[0][timestart]', timestart.toString());
    if (endDate) {
      const timeend = Math.floor(endDate.getTime() / 1000);
      formData.append('enrolments[0][timeend]', timeend.toString());
    }
    return formData;
  }

  private logDatosMatricula(
    moodleUserId: number,
    moodleCourseId: number,
    startDate: Date | undefined,
    endDate: Date | undefined,
    formData: URLSearchParams
  ): void {
    logger.debug('FormData para matrícula en Moodle:', Array.from(formData.entries()));
    logger.debug('Datos de matrícula:', {
      roleid: this.DEFAULT_ROLE_ID,
      userid: moodleUserId,
      courseid: moodleCourseId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
  }

  private validarRespuestaMatricula(response: any): void {
    if (!response) {
      logger.info('Matrícula exitosa - Moodle devolvió respuesta vacía (sin warnings)');
      return;
    }
    const moodleResponse = response as MoodleEnrolmentResponse;
    if (moodleResponse && moodleResponse.warnings && moodleResponse.warnings.length > 0) {
      const warningMessages = moodleResponse.warnings.map((w) => `${w.warningcode}: ${w.message}`).join(', ');
      logger.warn('Advertencias al matricular en Moodle:', warningMessages);
      const criticalWarnings = moodleResponse.warnings.filter(
        (w) => w.warningcode === 'usernotexist' || w.warningcode === 'coursenotexist' || w.warningcode === 'enrolnotpermitted'
      );
      if (criticalWarnings.length > 0) {
        throw new AppError(`Error crítico en matrícula: ${criticalWarnings.map((w) => w.message).join(', ')}`, 400);
      }
    }
  }

  /**
   * Verificar si un usuario ya está matriculado en un curso
   * @param moodleUserId - ID del usuario en Moodle
   * @param moodleCourseId - ID del curso en Moodle
   * @returns Promise<boolean> - true si ya está matriculado
   */
  async verificarMatriculaExiste(moodleUserId: number, moodleCourseId: number): Promise<boolean> {
    try {
      logger.debug(`Verificando matrícula existente: Usuario ${moodleUserId} en Curso ${moodleCourseId}`);

      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_enrol_get_enrolled_users');
      formData.append('courseid', moodleCourseId.toString());

      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      // Verificar si el usuario está en la lista de usuarios matriculados
      const enrolledUsers = response as unknown as Array<{ id: number }>;
      const isEnrolled = Array.isArray(enrolledUsers) && 
        enrolledUsers.some(user => user.id === moodleUserId);

      logger.debug(`Usuario ${moodleUserId} ${isEnrolled ? 'ya está matriculado' : 'no está matriculado'} en curso ${moodleCourseId}`);
      
      return isEnrolled;

    } catch (error) {
      logger.error('Error al verificar matrícula en Moodle:', {
        moodleUserId,
        moodleCourseId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // En caso de error, asumimos que no está matriculado
      return false;
    }
  }

  /**
   * Desmatricular un usuario de un curso
   * @param moodleUserId - ID del usuario en Moodle
   * @param moodleCourseId - ID del curso en Moodle
   * @returns Promise<boolean> - true si fue exitoso
   */
  async desmatricularUsuarioDelCurso(moodleUserId: number, moodleCourseId: number): Promise<boolean> {
    try {
      logger.info(`Desmatriculando usuario ${moodleUserId} del curso ${moodleCourseId} en Moodle`);

      const formData = new URLSearchParams();
      formData.append('wsfunction', 'enrol_manual_unenrol_users');
      formData.append('enrolments[0][userid]', moodleUserId.toString());
      formData.append('enrolments[0][courseid]', moodleCourseId.toString());

      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      // Validar respuesta similar a la matrícula
      const moodleResponse = response as MoodleEnrolmentResponse;

      if (moodleResponse.warnings && moodleResponse.warnings.length > 0) {
        const warningMessages = moodleResponse.warnings.map(w => w.message).join(', ');
        logger.warn('Advertencias al desmatricular de Moodle:', warningMessages);
      }

      logger.info(`Usuario desmatriculado exitosamente de Moodle`, {
        moodleUserId,
        moodleCourseId
      });

      return true;

    } catch (error) {
      logger.error('Error al desmatricular usuario en Moodle:', {
        moodleUserId,
        moodleCourseId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });

      throw new AppError(
        `Error al desmatricular usuario de Moodle: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        500
      );
    }
  }

  /**
   * Obtener información de matrícula de un usuario en un curso
   * @param moodleUserId - ID del usuario en Moodle
   * @param moodleCourseId - ID del curso en Moodle
   * @returns Promise con información de la matrícula o null si no está matriculado
   */
  async obtenerInfoMatricula(moodleUserId: number, moodleCourseId: number): Promise<any | null> {
    try {
      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_enrol_get_enrolled_users');
      formData.append('courseid', moodleCourseId.toString());

      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      const enrolledUsers = response as unknown as Array<any>;
      const userEnrolment = enrolledUsers.find(user => user.id === moodleUserId);

      return userEnrolment || null;

    } catch (error) {
      logger.error('Error al obtener información de matrícula:', {
        moodleUserId,
        moodleCourseId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      return null;
    }
  }
}

// Exportar instancia única del servicio
export const matriculaMoodleService = new MatriculaMoodleService();
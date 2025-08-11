import { PrismaClient } from "@prisma/client";
import { usuarioMoodleService } from "@/api/services/moodleService/usuarioMoodle.service";
import { cursoMoodleService } from "@/api/services/moodleService/cursoMoodle.service";
import { matriculaMoodleService } from "@/api/services/moodleService/matriculaMoodle.service";
import { InscripcionMoodleService } from "@/api/services/integrationService/inscripcionMoodle.service";
import { EstadoMatriculaMoodle } from "@/api/dtos/integrationDto/inscripcionMoodle.dto";
import { AppError } from "@/utils/errorTypes";
import { logger } from "@/utils/logger";

const prisma = new PrismaClient();
const inscripcionMoodleServicePersistence = new InscripcionMoodleService();

/**
 * Trigger para manejar eventos relacionados con inscripciones y Moodle
 * Maneja la sincronización automática de matrículas con Moodle
 */
export class InscripcionMoodleTrigger {

  /**
   * Ejecutar trigger de matrícula en Moodle cuando se activa la matrícula
   * @param inscripcionId - ID de la inscripción
   * @param inscripcionData - Datos de la inscripción con relaciones
   * @returns Promise<void>
   * @throws AppError si falla el proceso en Moodle
   */
  async ejecutarMatriculaEnMoodle(inscripcionId: number, inscripcionData: any): Promise<void> {
    try {
      logger.info(`Trigger activado: Procesando matrícula en Moodle para inscripción ${inscripcionId}`);
      
      // PASO 1: Crear/obtener usuario en Moodle
      const moodleUserId = await this.obtenerOCrearUsuarioMoodle(inscripcionData.persona);
      
      // PASO 2: Obtener ID del curso en Moodle usando búsqueda inteligente
      const moodleCourseId = await this.obtenerCursoMoodleConBusquedaInteligente(inscripcionData.curso);
      
      // PASO 3: Matricular usuario en el curso
      await this.matricularUsuarioEnCursoMoodle(
        inscripcionId,
        moodleUserId,
        moodleCourseId,
        inscripcionData
      );

    } catch (moodleError) {
      // Error en Moodle: revertir el estado de matrícula
      logger.error(`Error al procesar matrícula en Moodle, revirtiendo estado`, {
        inscripcionId,
        email: inscripcionData.persona.correo,
        error: moodleError instanceof Error ? moodleError.message : 'Error desconocido'
      });

      // Revertir el estado de matrícula a false
      await this.revertirEstadoMatricula(inscripcionId);

      // Lanzar error informativo
      throw new AppError(
        `Error al procesar matrícula en Moodle: ${moodleError instanceof Error ? moodleError.message : 'Error desconocido'}. La matrícula ha sido revertida a pendiente.`,
        500
      );
    }
  }

  /**
   * Obtener o crear usuario en Moodle
   * @param persona - Datos de la persona
   * @returns Promise<number> - ID del usuario en Moodle
   */
  private async obtenerOCrearUsuarioMoodle(persona: any): Promise<number> {
    let moodleUserId: number;
    
    // Primero intentar obtener el ID si ya existe
    const existingUserId = await usuarioMoodleService.obtenerMoodleUserIdPorEmail(persona.correo);
    
    if (existingUserId) {
      moodleUserId = existingUserId;
      logger.info(`Usuario ya existe en Moodle, usando ID existente: ${moodleUserId}`);
    } else {
      // Crear usuario en Moodle
      moodleUserId = await usuarioMoodleService.crearUsuarioEnMoodle(persona);
      logger.info(`Usuario creado exitosamente en Moodle: ${moodleUserId}`);
    }

    return moodleUserId;
  }

  /**
   * Obtener curso en Moodle usando estrategias de búsqueda múltiples
   * @param curso - Datos del curso
   * @returns Promise<number> - ID del curso en Moodle
   * @throws AppError si no se encuentra el curso
   */
  private async obtenerCursoMoodleConBusquedaInteligente(curso: any): Promise<number> {
    logger.debug(`Buscando curso en Moodle para: ${curso.nombreCortoCurso}`);
    
    let moodleCourseId: number | null = null;
    
    // ESTRATEGIA 1: Intentar búsqueda exacta por shortname
    const cursoShortname = this.generarShortnameParaBusqueda(curso.nombreCortoCurso);
    moodleCourseId = await cursoMoodleService.obtenerMoodleCourseIdPorShortname(cursoShortname);
    
    // ESTRATEGIA 2: Si no se encuentra, buscar por patrón de shortname
    if (!moodleCourseId) {
      logger.debug(`Curso no encontrado por shortname exacto: ${cursoShortname}, intentando búsqueda por patrón`);
      moodleCourseId = await cursoMoodleService.buscarCursoPorPatronShortname(cursoShortname);
    }
    
    // ESTRATEGIA 3: Si aún no se encuentra, buscar por nombre completo
    if (!moodleCourseId) {
      logger.debug(`Curso no encontrado por patrón, intentando búsqueda por nombre completo: ${curso.nombreCurso}`);
      moodleCourseId = await cursoMoodleService.buscarCursoPorNombreCompleto(curso.nombreCurso);
    }
    
    // Si ninguna estrategia funciona, lanzar error
    if (!moodleCourseId) {
      throw new AppError(
        `Curso no encontrado en Moodle después de múltiples intentos de búsqueda:\n` +
        `- Shortname exacto: ${cursoShortname}\n` +
        `- Patrón shortname: ${cursoShortname}*\n` +
        `- Nombre completo: "${curso.nombreCurso}"\n\n` +
        `Verifica que el curso se haya creado correctamente en Moodle.`,
        404
      );
    }

    logger.info(`Curso encontrado en Moodle: ${moodleCourseId}`);
    return moodleCourseId;
  }

  /**
   * Matricular usuario en curso de Moodle
   * @param inscripcionId - ID de la inscripción
   * @param moodleUserId - ID del usuario en Moodle
   * @param moodleCourseId - ID del curso en Moodle
   * @param inscripcionData - Datos de la inscripción
   * @returns Promise<void>
   */
  private async matricularUsuarioEnCursoMoodle(
    inscripcionId: number,
    moodleUserId: number,
    moodleCourseId: number,
    inscripcionData: any
  ): Promise<void> {
    // Verificar si ya está matriculado
    const yaMatriculado = await matriculaMoodleService.verificarMatriculaExiste(moodleUserId, moodleCourseId);
    
    if (!yaMatriculado) {
      await matriculaMoodleService.matricularUsuarioEnCurso(
        moodleUserId, 
        moodleCourseId,
        inscripcionData.curso.fechaInicioCurso,
        inscripcionData.curso.fechaFinCurso
      );
      
      logger.info(`Usuario matriculado exitosamente en curso de Moodle`, {
        inscripcionId,
        email: inscripcionData.persona.correo,
        moodleUserId,
        moodleCourseId,
        curso: inscripcionData.curso.nombreCortoCurso
      });

      // Guardar información de la matrícula en la base de datos
      await this.guardarInscripcionMoodle(inscripcionId, moodleUserId, inscripcionData.persona.correo);
    } else {
      logger.info(`Usuario ya está matriculado en el curso, omitiendo`, {
        inscripcionId,
        moodleUserId,
        moodleCourseId
      });

      // Guardar información de la matrícula existente en la base de datos
      await this.guardarInscripcionMoodle(inscripcionId, moodleUserId, inscripcionData.persona.correo);
    }
  }

  /**
   * Revertir estado de matrícula a false
   * @param inscripcionId - ID de la inscripción
   * @returns Promise<void>
   */
  private async revertirEstadoMatricula(inscripcionId: number): Promise<void> {
    try {
      await prisma.inscripcion.update({
        where: { idInscripcion: inscripcionId },
        data: { matricula: false }
      });
      
      logger.info(`Estado de matrícula revertido a false para inscripción ${inscripcionId}`);
      
    } catch (revertError) {
      logger.error(`Error crítico al revertir estado de matrícula ${inscripcionId}:`, {
        error: revertError instanceof Error ? revertError.message : 'Error desconocido'
      });
      
      // Este es un error crítico que requiere intervención manual
      throw new AppError(
        `Error crítico al revertir matrícula ${inscripcionId}. Se requiere intervención manual.`,
        500
      );
    }
  }

  /**
   * Generar shortname para búsqueda en Moodle
   * @param nombreCorto - Nombre corto del curso
   * @returns string - Shortname base para búsqueda
   */
  private generarShortnameParaBusqueda(nombreCorto: string): string {
    // Limpiar el nombre corto: solo letras, números y guiones
    const shortnameBase = nombreCorto
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .substring(0, 50); // Limitar longitud

    return shortnameBase;
  }

  /**
   * Ejecutar acciones pre-eliminación de inscripción
   * @param inscripcionId - ID de la inscripción a eliminar
   * @returns Promise<void>
   */
  async ejecutarPreEliminacion(inscripcionId: number): Promise<void> {
    try {
      logger.info(`Trigger pre-eliminación activado para inscripción ID ${inscripcionId}`);
      
      // Aquí se pueden agregar acciones como:
      // - Verificar si está matriculado en Moodle y desmatricular
      // - Archivar datos relacionados
      // - Notificar al usuario
      
      logger.info(`Trigger pre-eliminación completado para inscripción ID ${inscripcionId}`);
      
    } catch (error) {
      logger.error(`Error en trigger pre-eliminación de inscripción ${inscripcionId}:`, {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // En eliminaciones, podemos permitir que continúe o bloquear según el caso
      throw new AppError(
        `Error en validaciones pre-eliminación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        400
      );
    }
  }

  /**
   * Guardar información de la matrícula Moodle en la base de datos
   * @param inscripcionId - ID de la inscripción
   * @param moodleUserId - ID del usuario en Moodle
   * @param email - Email del usuario (usado como username en Moodle)
   * @returns Promise<void>
   */
  private async guardarInscripcionMoodle(inscripcionId: number, moodleUserId: number, email: string): Promise<void> {
    try {
      // Verificar si ya existe un registro
      const existeRegistro = await inscripcionMoodleServicePersistence.existeIntegracionMoodle(inscripcionId);
      
      if (!existeRegistro) {
        // Crear nuevo registro
        await inscripcionMoodleServicePersistence.createInscripcionMoodle({
          idInscripcion: inscripcionId,
          moodleUserId: moodleUserId,
          moodleUsername: email, // Usamos el email como username
          estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
          notas: 'Matrícula automática desde sistema de inscripciones'
        });

        logger.info(`Información de matrícula Moodle guardada en BD`, {
          inscripcionId,
          moodleUserId,
          moodleUsername: email
        });
      } else {
        logger.debug(`Ya existe registro de matrícula Moodle para inscripción ${inscripcionId}`);
      }

    } catch (error) {
      logger.error(`Error al guardar información de matrícula Moodle:`, {
        inscripcionId,
        moodleUserId,
        email,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // No lanzamos error para no interrumpir el flujo de matrícula
      // El proceso de Moodle ya fue exitoso, esto es solo persistencia adicional
    }
  }

  /**
   * Actualizar estado de matrícula Moodle en la base de datos
   * @param inscripcionId - ID de la inscripción
   * @param nuevoEstado - Nuevo estado de matrícula
   * @param notas - Notas adicionales
   * @returns Promise<void>
   */
  async actualizarEstadoMatriculaMoodle(inscripcionId: number, nuevoEstado: EstadoMatriculaMoodle, notas?: string): Promise<void> {
    try {
      const existeRegistro = await inscripcionMoodleServicePersistence.existeIntegracionMoodle(inscripcionId);
      
      if (existeRegistro) {
        await inscripcionMoodleServicePersistence.cambiarEstadoMatricula(inscripcionId, nuevoEstado, notas);
        
        logger.info(`Estado de matrícula Moodle actualizado`, {
          inscripcionId,
          nuevoEstado,
          notas
        });
      } else {
        logger.warn(`No se encontró registro de matrícula Moodle para inscripción ${inscripcionId}`);
      }

    } catch (error) {
      logger.error(`Error al actualizar estado de matrícula Moodle:`, {
        inscripcionId,
        nuevoEstado,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

// Exportar instancia única del trigger
export const inscripcionMoodleTrigger = new InscripcionMoodleTrigger();
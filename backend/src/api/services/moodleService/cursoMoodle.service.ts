// src/api/services/moodleService/cursoMoodle.service.ts

import moodleClient from '@/config/moodleClient';
import { AppError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';
import type { Curso } from '@prisma/client';

/**
 * Interfaz para los datos del curso en Moodle
 */
interface MoodleCourse {
  fullname: string;
  shortname: string;
  summary: string;
  summaryformat?: number;
  categoryid: number;
  visible?: number;
  format?: string;
  showgrades?: number;
  newsitems?: number;
  startdate?: number;
  enddate?: number;
  maxbytes?: number;
  showreports?: number;
  enablecompletion?: number;
  completionnotify?: number;
  lang?: string;
  forcetheme?: string;
}

/**
 * Interfaz para la respuesta de Moodle al crear curso
 */
interface MoodleCourseCreateResponse {
  id: number;
  shortname: string;
  warnings?: Array<{
    item: string;
    itemid: number;
    warningcode: string;
    message: string;
  }>;
}

/**
 * Servicio para gestionar cursos en Moodle
 */
export class CursoMoodleService {
  private readonly DEFAULT_CATEGORY_ID = 1; // Categoría por defecto en Moodle
  
  /**
   * Crear un curso en Moodle basándose en los datos del curso del sistema
   * @param curso - Datos del curso desde la base de datos
   * @returns Promise con el ID del curso creado en Moodle
   */
  async crearCursoEnMoodle(curso: Curso): Promise<number> {
    try {
      logger.info(`Iniciando creación de curso en Moodle: ${curso.nombreCortoCurso}`);

      // 1. Mapear datos de Prisma a formato Moodle
      const moodleCourse: MoodleCourse = this.mapearCursoToMoodle(curso);

      // 2. Preparar datos para FormData
      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_course_create_courses');
      formData.append('courses[0][fullname]', moodleCourse.fullname);
      formData.append('courses[0][shortname]', moodleCourse.shortname);
      formData.append('courses[0][summary]', moodleCourse.summary);
      formData.append('courses[0][summaryformat]', (moodleCourse.summaryformat || 1).toString());
      formData.append('courses[0][categoryid]', moodleCourse.categoryid.toString());
      formData.append('courses[0][visible]', (moodleCourse.visible || 1).toString());
      formData.append('courses[0][format]', moodleCourse.format || 'topics');
      formData.append('courses[0][showgrades]', (moodleCourse.showgrades || 1).toString());
      formData.append('courses[0][newsitems]', (moodleCourse.newsitems || 5).toString());
      formData.append('courses[0][enablecompletion]', (moodleCourse.enablecompletion || 1).toString());

      // Fechas (convertir a timestamp si están disponibles)
      if (moodleCourse.startdate) {
        formData.append('courses[0][startdate]', moodleCourse.startdate.toString());
      }
      if (moodleCourse.enddate) {
        formData.append('courses[0][enddate]', moodleCourse.enddate.toString());
      }

      // Idioma - removido para usar idioma por defecto del sitio

      logger.debug('FormData para crear curso en Moodle:', Array.from(formData.entries()));
      logger.debug('Datos del curso a crear:', {
        fullname: moodleCourse.fullname,
        shortname: moodleCourse.shortname,
        categoryid: moodleCourse.categoryid,
        startdate: moodleCourse.startdate,
        enddate: moodleCourse.enddate
      });

      // 3. Llamar a la API de Moodle
      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      // 4. Validar respuesta
      if (!response || !Array.isArray(response) || response.length === 0) {
        throw new AppError('Respuesta inválida de Moodle al crear curso', 500);
      }

      const moodleCourseResponse = response[0] as MoodleCourseCreateResponse;

      if (!moodleCourseResponse.id) {
        // Verificar si hay warnings
        if (moodleCourseResponse.warnings && moodleCourseResponse.warnings.length > 0) {
          const warningMessages = moodleCourseResponse.warnings.map(w => w.message).join(', ');
          throw new AppError(`Advertencias de Moodle al crear curso: ${warningMessages}`, 400);
        }
        throw new AppError('Moodle no devolvió un ID de curso válido', 500);
      }

      logger.info(`Curso creado exitosamente en Moodle. ID: ${moodleCourseResponse.id}, Shortname: ${moodleCourseResponse.shortname}`);
      
      return moodleCourseResponse.id;

    } catch (error) {
      logger.error('Error al crear curso en Moodle:', {
        nombreCortoCurso: curso.nombreCortoCurso,
        nombreCurso: curso.nombreCurso,
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      });

      // Re-lanzar como AppError para manejo consistente
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        `Error al crear curso en Moodle: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        500
      );
    }
  }

  /**
   * Buscar curso en Moodle por patrón de shortname (búsqueda más flexible)
   * @param shortnamePattern - Patrón base del shortname a buscar
   * @returns Promise<number | null> - ID del curso en Moodle o null si no existe
   */
  async buscarCursoPorPatronShortname(shortnamePattern: string): Promise<number | null> {
    try {
      logger.debug(`Buscando curso en Moodle por patrón: ${shortnamePattern}`);

      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_course_get_courses');

      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      const courses = response as unknown as Array<{ id: number; shortname: string; fullname: string }>;
      
      if (Array.isArray(courses)) {
        // Buscar curso que contenga el patrón base
        const matchingCourse = courses.find(course => 
          course.shortname.includes(shortnamePattern)
        );
        
        if (matchingCourse) {
          logger.debug(`Curso encontrado por patrón: ${matchingCourse.shortname} -> ID ${matchingCourse.id}`);
          return matchingCourse.id;
        }
      }

      logger.debug(`Curso no encontrado por patrón: ${shortnamePattern}`);
      return null;

    } catch (error) {
      logger.error('Error al buscar curso por patrón en Moodle:', {
        shortnamePattern,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      return null;
    }
  }

  /**
   * Buscar curso en Moodle por nombre completo
   * @param fullname - Nombre completo del curso
   * @returns Promise<number | null> - ID del curso en Moodle o null si no existe
   */
  async buscarCursoPorNombreCompleto(fullname: string): Promise<number | null> {
    try {
      logger.debug(`Buscando curso en Moodle por nombre completo: ${fullname}`);

      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_course_get_courses');

      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      const courses = response as unknown as Array<{ id: number; shortname: string; fullname: string }>;
      
      if (Array.isArray(courses)) {
        // Buscar curso por nombre completo exacto
        const matchingCourse = courses.find(course => 
          course.fullname === fullname
        );
        
        if (matchingCourse) {
          logger.debug(`Curso encontrado por nombre completo: ${matchingCourse.fullname} -> ID ${matchingCourse.id} (shortname: ${matchingCourse.shortname})`);
          return matchingCourse.id;
        }
      }

      logger.debug(`Curso no encontrado por nombre completo: ${fullname}`);
      return null;

    } catch (error) {
      logger.error('Error al buscar curso por nombre completo en Moodle:', {
        fullname,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      return null;
    }
  }

  /**
   * Obtener ID de curso en Moodle por shortname
   * @param shortname - Nombre corto del curso a buscar
   * @returns Promise<number | null> - ID del curso en Moodle o null si no existe
   */
  async obtenerMoodleCourseIdPorShortname(shortname: string): Promise<number | null> {
    try {
      logger.debug(`Buscando ID de curso en Moodle por shortname: ${shortname}`);

      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_course_get_courses_by_field');
      formData.append('field', 'shortname');
      formData.append('value', shortname);

      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      const result = response as any;
      
      if (result && result.courses && Array.isArray(result.courses) && result.courses.length > 0) {
        const courseId = result.courses[0].id;
        logger.debug(`Curso encontrado en Moodle: ${shortname} -> ID ${courseId}`);
        return courseId;
      }

      logger.debug(`Curso no encontrado en Moodle: ${shortname}`);
      return null;

    } catch (error) {
      logger.error('Error al buscar curso en Moodle por shortname:', {
        shortname,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      return null;
    }
  }

  /**
   * Verificar si un curso ya existe en Moodle por shortname
   * @param shortname - Nombre corto del curso a verificar
   * @returns Promise<boolean> - true si existe, false si no existe
   */
  async verificarCursoExiste(shortname: string): Promise<boolean> {
    try {
      logger.debug(`Verificando si curso existe en Moodle: ${shortname}`);

      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_course_get_courses_by_field');
      formData.append('field', 'shortname');
      formData.append('value', shortname);

      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      const exists = response && (response as any).courses && Array.isArray((response as any).courses) && (response as any).courses.length > 0;
      logger.debug(`Curso ${shortname} ${exists ? 'existe' : 'no existe'} en Moodle`);
      
      return exists;

    } catch (error) {
      logger.error('Error al verificar curso en Moodle:', {
        shortname,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // En caso de error, asumimos que no existe para evitar duplicados
      return false;
    }
  }

  /**
   * Mapear datos de curso de Prisma a formato Moodle
   * @param curso - Datos del curso desde la base de datos
   * @returns MoodleCourse - Objeto formateado para Moodle
   */
  private mapearCursoToMoodle(curso: Curso): MoodleCourse {
    // Convertir fechas a timestamp (segundos desde epoch)
    const startdate = Math.floor(curso.fechaInicioCurso.getTime() / 1000);
    const enddate = Math.floor(curso.fechaFinCurso.getTime() / 1000);

    return {
      fullname: curso.nombreCurso, // Nombre completo del curso
      shortname: this.generarShortname(curso.nombreCortoCurso), // Nombre corto único
      summary: this.generarResumen(curso), // Resumen del curso
      summaryformat: 1, // HTML format
      categoryid: this.DEFAULT_CATEGORY_ID, // Categoría por defecto
      visible: 1, // Curso visible
      format: 'topics', // Formato por temas
      showgrades: 1, // Mostrar calificaciones
      newsitems: 5, // Número de noticias en el foro
      startdate: startdate, // Fecha de inicio
      enddate: enddate, // Fecha de fin
      enablecompletion: 1, // Habilitar finalización del curso
      completionnotify: 0, // No notificar finalización
      // lang: removido - usar idioma por defecto del sitio
      maxbytes: 0, // Sin límite de tamaño de archivo
      showreports: 0 // No mostrar reportes por defecto
    };
  }

  /**
   * Generar un shortname único para Moodle
   * @param nombreCorto - Nombre corto del curso
   * @returns string - Shortname procesado
   */
  private generarShortname(nombreCorto: string): string {
    // Limpiar el nombre corto: solo letras, números y guiones
    const shortname = nombreCorto
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .substring(0, 50); // Limitar longitud

    // Agregar timestamp para evitar duplicados
    const timestamp = Date.now().toString().slice(-6);
    
    return `${shortname}-${timestamp}`;
  }

  /**
   * Generar resumen HTML del curso
   * @param curso - Datos del curso
   * @returns string - Resumen en HTML
   */
  private generarResumen(curso: Curso): string {
    const fechaInicio = curso.fechaInicioCurso.toLocaleDateString('es-ES');
    const fechaFin = curso.fechaFinCurso.toLocaleDateString('es-ES');
    
    return `
      <div>
        <h3>${curso.nombreCurso}</h3>
        <p><strong>Descripción:</strong> ${curso.descripcionCurso}</p>
        <p><strong>Modalidad:</strong> ${curso.modalidadCurso}</p>
        <p><strong>Duración:</strong> Del ${fechaInicio} al ${fechaFin}</p>
        <p><strong>Valor:</strong> $${curso.valorCurso}</p>
      </div>
    `.trim();
  }
}

// Exportar instancia única del servicio
export const cursoMoodleService = new CursoMoodleService();
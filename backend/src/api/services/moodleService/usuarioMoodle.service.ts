// src/api/services/moodleService/usuarioMoodle.service.ts

import moodleClient from '@/config/moodleClient';
import { AppError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';
import type { DatosPersonales } from '@prisma/client';

/**
 * Interfaz para los datos del usuario en Moodle
 */
interface MoodleUser {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  createpassword?: boolean;
  country?: string;
  city?: string;
  phone1?: string;
  institution?: string;
  department?: string;
  lang?: string;
  timezone?: string;
  mailformat?: number;
  maildigest?: number;
  maildisplay?: number;
  emailstop?: number;
  autosubscribe?: number;
  trackforums?: number;
  auth?: string;
  preferences?: Array<{
    type: string;
    value: string | number;
  }>;
}

/**
 * Interfaz para la respuesta de Moodle al crear usuario
 */
interface MoodleUserCreateResponse {
  id: number;
  username: string;
}

/**
 * Servicio para gestionar usuarios en Moodle
 */
export class UsuarioMoodleService {
  
  /**
   * Crear un usuario en Moodle basándose en los datos personales
   * @param datosPersonales - Datos del usuario desde la base de datos
   * @returns Promise con el ID del usuario creado en Moodle
   */
  async crearUsuarioEnMoodle(datosPersonales: DatosPersonales): Promise<number> {
    try {
      logger.info(`Iniciando creación de usuario en Moodle para: ${datosPersonales.correo}`);

      // 1. Mapear datos de Prisma a formato Moodle
      const moodleUser: MoodleUser = this.mapearDatosPersonalesToMoodle(datosPersonales);

      // 2. Preparar datos para FormData (requerido por Moodle para arrays complejos)
      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_user_create_users');
      formData.append('users[0][username]', moodleUser.username);
      formData.append('users[0][firstname]', moodleUser.firstname);
      formData.append('users[0][lastname]', moodleUser.lastname);
      formData.append('users[0][email]', moodleUser.email);
      formData.append('users[0][createpassword]', moodleUser.createpassword ? '1' : '0');

      // Campos opcionales solo si tienen valor
      if (moodleUser.country) {
        formData.append('users[0][country]', moodleUser.country);
      }
      if (moodleUser.city) {
        formData.append('users[0][city]', moodleUser.city);
      }
      if (moodleUser.phone1) {
        formData.append('users[0][phone1]', moodleUser.phone1);
      }
      if (moodleUser.institution) {
        formData.append('users[0][institution]', moodleUser.institution);
      }
      if (moodleUser.department) {
        formData.append('users[0][department]', moodleUser.department);
      }
      // lang: removido - usar idioma por defecto del sitio
      if (moodleUser.timezone) {
        formData.append('users[0][timezone]', moodleUser.timezone);
      }
      if (moodleUser.auth) {
        formData.append('users[0][auth]', moodleUser.auth);
      }

      // Preferencias
      if (moodleUser.preferences && moodleUser.preferences.length > 0) {
        moodleUser.preferences.forEach((pref, index) => {
          formData.append(`users[0][preferences][${index}][type]`, pref.type);
          formData.append(`users[0][preferences][${index}][value]`, pref.value.toString());
        });
      }

      logger.debug('FormData completa para Moodle:', Array.from(formData.entries()));
      logger.debug('Datos del usuario a crear:', { 
        username: moodleUser.username, 
        email: moodleUser.email,
        firstname: moodleUser.firstname,
        lastname: moodleUser.lastname,
        createpassword: moodleUser.createpassword,
        country: moodleUser.country,
        city: moodleUser.city,
        auth: moodleUser.auth
      });

      // 3. Llamar a la API de Moodle usando POST con FormData
      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      // 4. Validar respuesta
      if (!response || !Array.isArray(response) || response.length === 0) {
        throw new AppError('Respuesta inválida de Moodle al crear usuario', 500);
      }

      const moodleUserResponse = response[0] as MoodleUserCreateResponse;

      if (!moodleUserResponse.id) {
        throw new AppError('Moodle no devolvió un ID de usuario válido', 500);
      }

      logger.info(`Usuario creado exitosamente en Moodle. ID: ${moodleUserResponse.id}, Username: ${moodleUserResponse.username}`);
      
      return moodleUserResponse.id;

    } catch (error) {
      logger.error('Error al crear usuario en Moodle:', {
        email: datosPersonales.correo,
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      });

      // Re-lanzar como AppError para manejo consistente
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        `Error al crear usuario en Moodle: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        500
      );
    }
  }

  /**
   * Obtener ID de usuario en Moodle por email
   * @param email - Email del usuario a buscar
   * @returns Promise<number | null> - ID del usuario en Moodle o null si no existe
   */
  async obtenerMoodleUserIdPorEmail(email: string): Promise<number | null> {
    try {
      logger.debug(`Buscando ID de usuario en Moodle por email: ${email}`);

      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_user_get_users_by_field');
      formData.append('field', 'email');
      formData.append('values[0]', email);

      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      const users = response as unknown as Array<{ id: number; email: string }>;
      
      if (Array.isArray(users) && users.length > 0) {
        const userId = users[0].id;
        logger.debug(`Usuario encontrado en Moodle: ${email} -> ID ${userId}`);
        return userId;
      }

      logger.debug(`Usuario no encontrado en Moodle: ${email}`);
      return null;

    } catch (error) {
      logger.error('Error al buscar usuario en Moodle por email:', {
        email,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      return null;
    }
  }

  /**
   * Verificar si un usuario ya existe en Moodle por email
   * @param email - Email del usuario a verificar
   * @returns Promise<boolean> - true si existe, false si no existe
   */
  async verificarUsuarioExiste(email: string): Promise<boolean> {
    try {
      logger.debug(`Verificando si usuario existe en Moodle: ${email}`);

      const formData = new URLSearchParams();
      formData.append('wsfunction', 'core_user_get_users_by_field');
      formData.append('field', 'email');
      formData.append('values[0]', email);

      const response = await moodleClient.post('', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      const exists = Array.isArray(response) && response.length > 0;
      logger.debug(`Usuario ${email} ${exists ? 'existe' : 'no existe'} en Moodle`);
      
      return exists;

    } catch (error) {
      logger.error('Error al verificar usuario en Moodle:', {
        email,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      // En caso de error, asumimos que no existe para evitar duplicados
      return false;
    }
  }

  /**
   * Mapear datos personales de Prisma a formato Moodle (versión simplificada)
   * @param datosPersonales - Datos desde la base de datos
   * @returns MoodleUser - Objeto formateado para Moodle
   */
  private mapearDatosPersonalesToMoodle(datosPersonales: DatosPersonales): MoodleUser {
    return {
      username: datosPersonales.correo, // Usar email como username
      firstname: datosPersonales.nombres,
      lastname: datosPersonales.apellidos,
      email: datosPersonales.correo,
      createpassword: true, // Moodle genera password automáticamente
      // Campos opcionales básicos
      country: this.mapearPais(datosPersonales.pais),
      city: datosPersonales.ciudad || '',
      phone1: datosPersonales.numTelefono || '',
      institution: datosPersonales.institucion || '',
      department: datosPersonales.profesion || '',
      // lang: removido - usar idioma por defecto del sitio  
      auth: 'manual', // Autenticación manual
      // Preferencias simplificadas
      preferences: [
        {
          type: 'auth_forcepasswordchange',
          value: 1 // Forzar cambio de contraseña en el primer login
        }
      ]
    };
  }

  /**
   * Mapear código de país a formato ISO de 2 letras
   * @param pais - Nombre del país
   * @returns string - Código ISO del país
   */
  private mapearPais(pais: string): string {
    const mapaPaises: Record<string, string> = {
      'Ecuador': 'EC',
      'Colombia': 'CO',
      'Perú': 'PE',
      'Venezuela': 'VE',
      'Bolivia': 'BO',
      'Chile': 'CL',
      'Argentina': 'AR',
      'Brasil': 'BR',
      'Uruguay': 'UY',
      'Paraguay': 'PY',
      'México': 'MX',
      'Estados Unidos': 'US',
      'España': 'ES',
      // Agregar más países según necesidad
    };

    return mapaPaises[pais] || 'EC'; // Ecuador por defecto
  }
}

// Exportar instancia única del servicio
export const usuarioMoodleService = new UsuarioMoodleService();
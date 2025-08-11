// src/config/moodleClient.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'https';
import { config } from 'dotenv';
import { AppError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';

// Cargar variables de entorno explícitamente
config();

// 1. Obtener la configuración desde las variables de entorno
const moodleUrl = process.env['MOODLE_URL'];
const moodleToken = process.env['MOODLE_TOKEN'];
const nodeEnv = process.env['NODE_ENV'] || 'development';

// Debug solo en desarrollo
if (nodeEnv === 'development') {
  logger.info('🔗 Configuración de Moodle:', {
    url: moodleUrl,
    token: moodleToken ? 'Token presente' : 'Token ausente',
    environment: nodeEnv
  });
}

// 2. Validar que las variables de entorno necesarias estén definidas
if (!moodleUrl || !moodleToken) {
  throw new AppError('Las variables de entorno MOODLE_URL y MOODLE_TOKEN son requeridas.', 500, false);
}

// 3. Configuración HTTPS personalizada
const httpsAgent = new https.Agent({
  rejectUnauthorized: nodeEnv === 'production', // Solo validar SSL en producción
  keepAlive: true,
  maxSockets: 50,
  timeout: 30000
});

// 4. Configuración base de Axios
const axiosConfig: AxiosRequestConfig = {
  baseURL: moodleUrl,
  timeout: 30000, // 30 segundos
  params: {
    wstoken: moodleToken,
    moodlewsrestformat: 'json',
  },
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'CEPEIGE-Sistema/1.0',
    'Accept': 'application/json'
  }
};

// 5. Configurar agente HTTPS solo si la URL es HTTPS
if (moodleUrl.startsWith('https://')) {
  axiosConfig.httpsAgent = httpsAgent;
}

// 6. Crear una instancia de Axios pre-configurada para Moodle
const moodleClient: AxiosInstance = axios.create(axiosConfig);

// 7. Interceptor de peticiones para logging
moodleClient.interceptors.request.use(
  (config) => {
    if (nodeEnv === 'development') {
      logger.info('🚀 Petición a Moodle:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        timestamp: new Date().toISOString()
      });
    }
    return config;
  },
  (error) => {
    logger.error('❌ Error en petición a Moodle:', error);
    return Promise.reject(error);
  }
);

// 8. Interceptor de respuestas para manejo de errores y logging
moodleClient.interceptors.response.use(
  (response) => {
    // Log de respuesta exitosa en desarrollo
    if (nodeEnv === 'development') {
      logger.info('✅ Respuesta de Moodle:', {
        status: response.status,
        url: response.config.url,
        dataSize: JSON.stringify(response.data).length + ' chars',
        timestamp: new Date().toISOString()
      });
    }

    // Si Moodle devuelve un error en una respuesta 200 OK (comportamiento típico de Moodle)
    if (response.data && response.data.exception) {
      const moodleError = new AppError(
        `Error en la API de Moodle: ${response.data.message || response.data.exception}`,
        400,
        true
      );
      
      logger.error('⚠️ Error de Moodle (HTTP 200):', {
        exception: response.data.exception,
        message: response.data.message,
        errorcode: response.data.errorcode,
        url: response.config.url
      });

      return Promise.reject(moodleError);
    }

    // Devolver directamente response.data para simplificar los servicios
    return response.data;
  },
  (error) => {
    // Manejar errores de red, HTTP o timeouts
    let errorMessage = 'Error desconocido en la comunicación con Moodle';
    let statusCode = 500;

    if (error.code === 'ENOTFOUND') {
      errorMessage = 'No se pudo conectar con el servidor de Moodle. Verifica la URL.';
      statusCode = 503;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Conexión rechazada por el servidor de Moodle.';
      statusCode = 503;
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout en la conexión con Moodle. Intenta de nuevo.';
      statusCode = 408;
    } else if (error.response) {
      // Error HTTP con respuesta del servidor
      errorMessage = error.response.data?.message || 
                    error.response.data?.error || 
                    `Error HTTP ${error.response.status}: ${error.response.statusText}`;
      statusCode = error.response.status;
    } else if (error.request) {
      // Error de red sin respuesta
      errorMessage = 'No se recibió respuesta del servidor de Moodle';
      statusCode = 503;
    } else {
      // Error en la configuración de la petición
      errorMessage = error.message || errorMessage;
    }

    logger.error('❌ Error en comunicación con Moodle:', {
      error: errorMessage,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString()
    });

    return Promise.reject(new AppError(errorMessage, statusCode, true));
  }
);

// 9. Función utilitaria para hacer peticiones GET a Moodle
export const moodleGet = async (wsfunction: string, additionalParams: Record<string, any> = {}) => {
  try {
    const params = {
      wsfunction,
      ...additionalParams
    };
    
    return await moodleClient.get('', { params });
  } catch (error) {
    logger.error(`Error en función Moodle ${wsfunction}:`, error);
    throw error;
  }
};

// 10. Función utilitaria para hacer peticiones POST a Moodle
export const moodlePost = async (wsfunction: string, data: Record<string, any> = {}) => {
  try {
    const formData = new URLSearchParams();
    formData.append('wsfunction', wsfunction);
    
    // Convertir objeto a form data
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            Object.entries(item).forEach(([subKey, subValue]) => {
              formData.append(`${key}[${index}][${subKey}]`, String(subValue));
            });
          } else {
            formData.append(`${key}[${index}]`, String(item));
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          formData.append(`${key}[${subKey}]`, String(subValue));
        });
      } else {
        formData.append(key, String(value));
      }
    });
    
    return await moodleClient.post('', formData);
  } catch (error) {
    logger.error(`Error en función Moodle ${wsfunction}:`, error);
    throw error;
  }
};

// 11. Función para verificar conectividad con Moodle
export const testMoodleConnection = async (): Promise<boolean> => {
  try {
    logger.info('🔍 Probando conexión con Moodle...');
    await moodleGet('core_webservice_get_site_info');
    logger.info('✅ Conexión con Moodle exitosa');
    return true;
  } catch (error) {
    logger.error('❌ Error al conectar con Moodle:', error);
    return false;
  }
};

export default moodleClient;
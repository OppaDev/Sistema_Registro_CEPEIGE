// src/config/moodleClient.ts

import axios from 'axios';
import { config } from 'dotenv';
import { AppError } from '@/utils/errorTypes';

// Cargar variables de entorno explícitamente
config();

// 1. Obtener la configuración desde las variables de entorno
const moodleUrl = process.env['MOODLE_URL'];
const moodleToken = process.env['MOODLE_TOKEN'];

// Debug: mostrar valores (quitar en producción)
console.log('Moodle URL:', moodleUrl);
console.log('Moodle Token:', moodleToken ? 'Token presente' : 'Token ausente');

// 2. Validar que las variables de entorno necesarias estén definidas
if (!moodleUrl || !moodleToken) {
  throw new AppError('Las variables de entorno MOODLE_URL y MOODLE_TOKEN son requeridas.', 500, false);
}

// 3. Crear una instancia de Axios pre-configurada para Moodle
const moodleClient = axios.create({
  baseURL: moodleUrl,
  params: {
    wstoken: moodleToken,
    moodlewsrestformat: 'json',
  },
});

// 4. (Opcional) Interceptores para manejar respuestas o errores de forma centralizada
moodleClient.interceptors.response.use(
  (response) => {
    // Si Moodle devuelve un error en una respuesta 200 OK (lo cual hace a veces)
    if (response.data && response.data.exception) {
      return Promise.reject(
        new AppError(
          `Error en la API de Moodle: ${response.data.message}`,
          400 // O el código que consideres apropiado
        )
      );
    }
    return response.data; // Devolver directamente `response.data` para simplificar los servicios
  },
  (error) => {
    // Manejar errores de red o HTTP
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido en la comunicación con Moodle';
    return Promise.reject(new AppError(errorMessage, error.response?.status || 500));
  }
);

export default moodleClient;
// services/api.ts - ACTUALIZAR PARA INCLUIR AUTH
import axios from 'axios';
import { authService } from './authService'; // 🆕 IMPORTAR

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🆕 INTERCEPTOR PARA AGREGAR TOKEN AUTOMÁTICAMENTE
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    
    // Agregar token de autorización si existe
    const authHeaders = authService.getAuthHeader();
    if (authHeaders.Authorization) {
      config.headers.Authorization = authHeaders.Authorization;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 🆕 INTERCEPTOR PARA MANEJAR RESPUESTAS Y ERRORES DE AUTH
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
    
    // Si el token expiró (401), intentar refrescar
    if (error.response?.status === 401 && authService.isAuthenticated()) {
      try {
        await authService.refreshToken();
        // Reintentar la petición original
        return api.request(error.config);
      } catch (refreshError) {
        // Si falla el refresh, cerrar sesión
        await authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

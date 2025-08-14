// services/authService.ts - NUEVO ARCHIVO
import { LoginCredentials, LoginResponse, User } from '@/models/login/auth';
import { TokenManager } from '@/lib/tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export class AuthService {
  // Login del usuario
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🚀 Iniciando sesión para:', credentials.email);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('📥 Respuesta login:', { success: data.success, email: credentials.email });

      if (!response.ok) {
        throw new Error(data.message || 'Error en el inicio de sesión');
      }

      // Guardar tokens y datos del usuario
      if (data.success && data.data) {
        TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        
        // Normalizar datos del usuario con roles consistentes
        const userData = {
          ...data.data.user,
          id: data.data.user.idUsuario || data.data.user.id,
          roles: this.normalizeRoles(data.data.user.roles || [])
        };
        
        TokenManager.setUser(userData);
        console.log('✅ Tokens y usuario guardados exitosamente:', userData);
        
        // Devolver datos normalizados para uso inmediato
        return {
          ...data,
          data: {
            ...data.data,
            user: userData
          }
        };
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw new Error(error.message || 'Error de conexión');
    }
  }

  // Normalizar nombres de roles para consistencia
  private normalizeRoles(roles: string[]): string[] {
    return roles.map(role => {
      const normalizedRole = role.toLowerCase().trim();
      switch (normalizedRole) {
        case 'admin':
          return 'ADMIN';
        case 'contador':
          return 'CONTADOR';
        case 'super-admin':
          return 'SUPER_ADMIN';
        default:
          return role.toUpperCase();
      }
    });
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      const accessToken = TokenManager.getAccessToken();
      
      if (refreshToken && accessToken) {
        // Intentar cerrar sesión en el servidor
        try {
          console.log('🔄 Intentando logout en servidor...', { 
            url: `${API_BASE_URL}/auth/logout`,
            hasRefreshToken: !!refreshToken,
            hasAccessToken: !!accessToken 
          });
          
          const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          console.log('📡 Respuesta logout servidor:', {
            status: response.status,
            ok: response.ok
          });
          
          if (response.ok) {
            console.log('✅ Sesión cerrada en servidor');
          } else {
            console.warn('⚠️ Logout falló en servidor:', response.status);
          }
        } catch (error) {
          console.warn('⚠️ Error cerrando sesión en servidor:', error);
        }
      } else {
        console.log('⚠️ No hay tokens para logout en servidor');
      }

      // Limpiar datos locales siempre
      TokenManager.clearAll();
      console.log('✅ Sesión cerrada localmente');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Limpiar datos locales aunque falle el servidor
      TokenManager.clearAll();
    }
  }

  // Refrescar token
  async refreshToken(): Promise<{ accessToken: string; expiresIn: string }> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al refrescar token');
      }

      // Actualizar access token
      TokenManager.setTokens(data.data.accessToken, refreshToken);

      return data.data;
    } catch (error: any) {
      console.error('❌ Error refrescando token:', error);
      // Si falla el refresh, limpiar todo
      TokenManager.clearAll();
      throw error;
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return TokenManager.hasValidTokens();
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return TokenManager.getUser();
  }

  // Verificar token con el servidor
  async verifyToken(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const accessToken = TokenManager.getAccessToken();
      
      if (!accessToken) {
        return { success: false, message: 'No hay token' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Si el token es válido, asegurar que los datos del usuario estén actualizados
        if (data.data?.user) {
          const userData = {
            ...data.data.user,
            id: data.data.user.idUsuario || data.data.user.id,
            roles: this.normalizeRoles(data.data.user.roles || [])
          };
          TokenManager.setUser(userData);
        }
        return { success: true, data: data.data };
      }
      
      return { success: false, message: data.message || 'Token inválido' };
    } catch (error: any) {
      console.error('❌ Error verificando token:', error);
      return { success: false, message: error.message };
    }
  }

  // Obtener header de autorización
  getAuthHeader(): Record<string, string> {
    const accessToken = TokenManager.getAccessToken();
    
    if (!accessToken) {
      console.warn('⚠️ AuthService: No hay token de acceso disponible');
      return {};
    }

    console.log('🔑 AuthService: Token encontrado para headers');
    return {
      'Authorization': `Bearer ${accessToken}`
    };
  }
}

export const authService = new AuthService();

// contexts/AuthContext.tsx - NUEVO ARCHIVO
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState, getUserType, UserType } from '@/models/login/auth';
import { authService } from '@/services/login/authService';
import { TokenManager } from '@/lib/tokenManager';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ user: User; userType: UserType } | void>;
  logout: () => Promise<void>;
  userType: UserType;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Inicializar autenticación al cargar
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Verificar si hay tokens guardados
      if (!authService.isAuthenticated()) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Obtener usuario guardado
      const savedUser = authService.getCurrentUser();
      if (!savedUser) {
        TokenManager.clearAll();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Verificar token con el servidor
      const tokenVerification = await authService.verifyToken();
      if (!tokenVerification.success) {
        TokenManager.clearAll();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Sesión expirada',
        });
        return;
      }

      // Usuario autenticado
      setAuthState({
        user: savedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ Usuario autenticado:', savedUser.email);
    } catch (error: any) {
      console.error('❌ Error inicializando auth:', error);
      TokenManager.clearAll();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Error de autenticación',
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🚀 AuthContext: Iniciando login para:', email);
      
      const response = await authService.login({ email, password });
      console.log('📥 AuthContext: Respuesta de login:', response);
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const userTypeResult = getUserType(userData.roles);
        
        // Actualizar estado del contexto
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        console.log('✅ AuthContext: Usuario autenticado:', userData);
        console.log('✅ AuthContext: Tipo de usuario:', userTypeResult);
        
        // Devolver los datos para redirección inmediata en LoginView
        return {
          user: userData,
          userType: userTypeResult
        };
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Error en login:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al iniciar sesión',
        isAuthenticated: false,
        user: null,
      }));
      throw error;
    }
  };
// ...existing code...

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await authService.logout();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Logout exitoso');
    } catch (error: any) {
      console.error('❌ Error en logout:', error);
      // Limpiar estado local aunque falle
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const refreshAuth = async () => {
    await initializeAuth();
  };

  const userType = authState.user ? getUserType(authState.user.roles) : null;

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    userType,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

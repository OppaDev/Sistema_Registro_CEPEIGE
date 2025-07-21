// models/auth.ts - NUEVO ARCHIVO
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  idUsuario?: number; // Compatibilidad con backend
  email: string;
  nombres: string;
  apellidos: string;
  roles: string[];
  permisos?: string[];
  ultimoAcceso?: Date | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  message: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Tipos de usuario basados en roles
export type UserType = 'admin' | 'accountant' | null;

// Función helper para determinar tipo de usuario
export const getUserType = (roles: string[]): UserType => {
  console.log('🔍 getUserType: Evaluando roles:', roles);
  
  if (roles.includes('ADMIN') || roles.includes('admin') || roles.includes('Admin')) {
    console.log('✅ getUserType: Rol admin detectado');
    return 'admin';
  }
  if (roles.includes('CONTADOR') || roles.includes('contador') || roles.includes('Contador')) {
    console.log('✅ getUserType: Rol contador detectado');
    return 'accountant';
  }
  
  console.log('❌ getUserType: Rol no reconocido');
  return null;
};

// Rutas permitidas por rol
export const ROLE_ROUTES = {
  admin: ['/inscripciones_admin', '/cursos_admin'],
  accountant: ['/inscripciones_contador']
} as const;

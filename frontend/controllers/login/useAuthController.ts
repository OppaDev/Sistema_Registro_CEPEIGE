// controllers/useAuthController.ts - NUEVO ARCHIVO
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_ROUTES } from '@/models/login/auth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useAuthController = () => {
  const auth = useAuth();
  const router = useRouter();

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      await auth.login(email, password);
      
      // Redirigir según el rol
      if (auth.userType === 'super_admin' || auth.userType === 'admin') {
        router.push('/inscripciones_admin');
      } else if (auth.userType === 'accountant') {
        router.push('/inscripciones_contador');
      }
    } catch (error) {
      throw error; // Re-lanzar para que lo maneje el componente
    }
  }, [auth, router]);

  const handleLogout = useCallback(async () => {
    try {
      await auth.logout();
      router.push('/login');
    } catch (error) {
      console.error('Error en logout:', error);
      // Redirigir al login de todas formas
      router.push('/login');
    }
  }, [auth, router]);

  const redirectToAppropriateRoute = useCallback(() => {
    if (auth.userType === 'super_admin' || auth.userType === 'admin') {
      router.push('/inscripciones_admin');
    } else if (auth.userType === 'accountant') {
      router.push('/inscripciones_contador');
    } else {
      router.push('/login');
    }
    }, [auth.userType, router]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!auth.user) return false;
    
    // Super admin y admin tienen todos los permisos
    if (auth.userType === 'super_admin' || auth.userType === 'admin') return true;
    
    // Verificar permisos específicos
    return auth.user.permisos?.includes(permission) || false;
  }, [auth.user, auth.userType]);

  const canAccessRoute = useCallback((route: string): boolean => {
    if (!auth.userType) return false;
    
    const allowedRoutes = ROLE_ROUTES[auth.userType];
    return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
  }, [auth.userType]);

  return {
    // Estado de autenticación
    ...auth,
    
    // Acciones
    handleLogin,
    handleLogout,
    redirectToAppropriateRoute,
    
    // Utilidades
    hasPermission,
    canAccessRoute,
    
    // Información del usuario
    userName: auth.user ? `${auth.user.nombres || ''} ${auth.user.apellidos || ''}`.trim() : '',
    userEmail: auth.user?.email || '',
    userRoles: auth.user?.roles || [],
  };
};

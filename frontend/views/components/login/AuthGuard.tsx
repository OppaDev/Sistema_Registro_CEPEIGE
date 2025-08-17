// views/components/AuthGuard.tsx - NUEVO ARCHIVO
"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_ROUTES } from '@/models/login/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'accountant';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, userType } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('🔐 AuthGuard: Estado actual:', { isAuthenticated, isLoading, userType, requiredRole, pathname });
    
    // Si está cargando, no hacer nada
    if (isLoading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      console.log('❌ AuthGuard: Usuario no autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }

    // Si se requiere un rol específico y no lo tiene
    if (requiredRole && userType !== requiredRole) {
      console.log('⚠️ AuthGuard: Rol requerido:', requiredRole, 'Rol actual:', userType);
      // Redirigir a la ruta apropiada para su rol
      if (userType === 'admin') {
        router.push('/inscripciones_admin');
      } else if (userType === 'accountant') {
        router.push('/inscripciones_contador');
      } else {
        router.push('/login');
      }
      return;
    }

    // Verificar si la ruta actual está permitida para el rol
    if (userType && ROLE_ROUTES[userType]) {
      const allowedRoutes = ROLE_ROUTES[userType];
      const isRouteAllowed = allowedRoutes.some(route => pathname.startsWith(route));
      
      if (!isRouteAllowed) {
        // Redirigir a la primera ruta permitida
        router.push(allowedRoutes[0]);
        return;
      }
    }
  }, [isAuthenticated, isLoading, userType, requiredRole, router, pathname]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar contenido
  if (!isAuthenticated) {
    return null;
  }

  // Si se requiere un rol específico y no lo tiene, no mostrar contenido
  if (requiredRole && userType !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

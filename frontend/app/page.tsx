// app/page.tsx - ACTUALIZAR PARA REDIRIGIR
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ParticipantRegistrationView from '@/views/ParticipantRegistrationView';

export default function HomePage() {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🏠 HomePage: Estado de auth:', { isAuthenticated, userType, isLoading });
    
    // Si está autenticado, redirigir a su dashboard
    if (!isLoading && isAuthenticated && userType) {
      console.log('🏠 HomePage: Redirigiendo usuario autenticado con tipo:', userType);
      
      if (userType === 'admin') {
        console.log('🏠 HomePage: Redirigiendo admin a inscripciones_admin');
        router.push('/inscripciones_admin');
      } else if (userType === 'accountant') {
        console.log('🏠 HomePage: Redirigiendo contador a inscripciones_contador');
        router.push('/inscripciones_contador');
      }
    }
  }, [isAuthenticated, userType, isLoading, router]);

  // Si está cargando o está autenticado, no mostrar el formulario público
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar formulario público para usuarios no autenticados
  return <ParticipantRegistrationView />;
}

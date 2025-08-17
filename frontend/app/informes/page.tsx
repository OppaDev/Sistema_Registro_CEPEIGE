'use client';

import { useAuth } from '@/contexts/AuthContext';
import ReportsView from '@/views/ReportsView';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InformesPage() {
  console.log('📄 InformesPage: Componente montado');
  
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log('📄 InformesPage: Estado actual', { user: !!user, isLoading });

  useEffect(() => {
    console.log('📄 InformesPage: useEffect ejecutado', { user: !!user, isLoading });
    if (!isLoading && !user) {
      console.log('📄 InformesPage: Redirigiendo a login');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    console.log('📄 InformesPage: Mostrando loading');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('📄 InformesPage: No hay usuario, retornando null');
    return null;
  }

  console.log('📄 InformesPage: Renderizando ReportsView');
  return <ReportsView />;
}
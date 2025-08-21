// views/LoginView.tsx - NUEVO ARCHIVO
"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './components/login/LoginForm';

export default function LoginView() {
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log('🚀 LoginView: Iniciando login para:', email);
      
      // login() devuelve los datos del usuario inmediatamente después del login exitoso
      const loginResult = await login(email, password);
      
      console.log('📥 LoginView: Resultado de login:', loginResult);
      
      if (loginResult?.user && loginResult?.userType) {
        const { userType } = loginResult;
        console.log('🎯 LoginView: Tipo de usuario detectado:', userType);
        
        // Redirigir basado en el tipo de usuario normalizado
        if (userType === 'admin') {
          console.log('➡️ LoginView: Redirigiendo a inscripciones_admin');
          router.replace('/inscripciones_admin');
        } else if (userType === 'accountant') {
          console.log('➡️ LoginView: Redirigiendo a inscripciones_contador');
          router.replace('/inscripciones_contador');
        } else {
          console.log('⚠️ LoginView: Tipo de usuario no reconocido, redirigiendo a admin por defecto');
          router.replace('/inscripciones_admin');
        }
      } else {
        console.error('❌ LoginView: No se pudieron obtener los datos del usuario');
        router.replace('/inscripciones_admin'); // Fallback
      }
    } catch (error) {
      console.error('❌ LoginView: Error en handleLogin:', error);
      // El error ya se maneja en el AuthContext, no necesitamos hacer nada más
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0367A6 0%, #02549E 50%, #F3762B 100%)'
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image 
            src="/Logo__cepeige.png" 
            alt="Logo CEPEIGE" 
            width={80}
            height={80}
            className="h-20 mx-auto mb-4 drop-shadow-lg"
            priority
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            Sistema CEPEIGE
          </h1>
          <p className="text-blue-100">
            Gestión de Inscripciones y Cursos
          </p>
        </div>

        {/* Formulario de Login */}
        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
        />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-100 text-sm">
            © {new Date().getFullYear()} CEPEIGE. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
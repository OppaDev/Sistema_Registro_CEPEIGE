// app/page.tsx - CORREGIDO
"use client";

import ParticipantRegistrationView from '@/views/ParticipantRegistrationView';

export default function HomePage() {
  // ✅ SIEMPRE mostrar el formulario público
  // ✅ No importa si hay admin logueado en otra pestaña
  return <ParticipantRegistrationView />;
}
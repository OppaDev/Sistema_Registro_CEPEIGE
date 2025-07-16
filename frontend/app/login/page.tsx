'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    const res = await login(form.email, form.password);
    if (res.token) {
      localStorage.setItem('token', res.token);
      // Siempre toma el primer rol del array si existe
      let role = (Array.isArray(res.roles) && res.roles.length > 0) ? res.roles[0] : res.role;
      console.log('Rol detectado:', role, res);
      localStorage.setItem('role', role);

     if (role === 'Admin') {
  try {
    router.push('/inscripciones_admin');
  } catch {
    window.location.href = '/inscripciones_admin';
  }
} else if (role === 'Contador') {
  try {
    router.push('/inscripciones_contador');
  } catch {
    window.location.href = '/inscripciones_contador';
  }
} else {
  setError('Rol no autorizado');
}
    } else {
      setError(res.message || 'Credenciales incorrectas');
    }
  } catch (err) {
    setError('Error de conexión');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h1>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
          required
        />
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
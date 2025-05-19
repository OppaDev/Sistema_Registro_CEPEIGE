"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    ciOrPassport: '',
    fullName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    country: '',
    cityOrProvince: '',
    profession: '',
    institution: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await axios.post('http://10.40.32.213:3000/api/form-data', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage({
        text: response.data.message || 'Registro exitoso',
        type: 'success'
      });
      setFormData({
        ciOrPassport: '',
        fullName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        country: '',
        cityOrProvince: '',
        profession: '',
        institution: ''
      });
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Error al registrar',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-orange-100 rounded-xl shadow-xl">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <img src="/logo1.jpeg" alt="Logo del formulario" className="h-45" />
      </div>

      <h2 className="text-3xl font-bold text-center text-white bg-orange-500 py-2 rounded mb-6">
        Formulario de Inscripción
      </h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <Input label="Cédula o Pasaporte" name="ciOrPassport" value={formData.ciOrPassport} handleChange={handleChange} />
        <Input label="Nombres" name="fullName" value={formData.fullName} handleChange={handleChange} />
        <Input label="Apellidos" name="lastName" value={formData.lastName} handleChange={handleChange} />
        <Input label="Teléfono" name="phoneNumber" value={formData.phoneNumber} handleChange={handleChange} />
        <Input label="Correo Electrónico" name="email" value={formData.email} type="email" handleChange={handleChange} />
        <Input label="País" name="country" value={formData.country} handleChange={handleChange} />
        <Input label="Ciudad o Provincia" name="cityOrProvince" value={formData.cityOrProvince} handleChange={handleChange} />
        <Input label="Profesión" name="profession" value={formData.profession} handleChange={handleChange} />
        <Input label="Institución" name="institution" value={formData.institution} handleChange={handleChange} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

type InputProps = {
  label: string;
  name: string;
  value: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

const Input = ({ label, name, value, handleChange, type = "text" }: InputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
    />
  </div>
);

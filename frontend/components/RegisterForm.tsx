// component: RegisterForm.tsx

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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'ciOrPassport': {
        const cedulaRegex = /^\d{10}$/;
        const pasaporteRegex = /^[A-Z]{2}\d{6}$/;
        if (!cedulaRegex.test(value) && !pasaporteRegex.test(value)) {
          error = 'Cédula: 10 dígitos o Pasaporte: 2 letras y 6 dígitos (Ej: AB123456)';
        }
        break;
      }
      case 'fullName':
      case 'lastName': {
        const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/;
        if (!nameRegex.test(value)) {
          error = 'Solo letras y espacios, mínimo 2 caracteres.';
        }
        break;
      }
      case 'phoneNumber': {
        const phoneRegex = /^\+?\d{7,15}$/;
        if (!phoneRegex.test(value)) {
          error = 'Solo números, entre 7 y 15 dígitos, puede iniciar con +.';
        }
        break;
      }
      case 'email': {
        const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          error = 'Correo: formato inválido.';
        }
        break;
      }
      case 'country':
      case 'profession':
      case 'institution': {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/;
        if (!regex.test(value)) {
          error = 'Solo letras y espacios, mínimo 2 caracteres.';
        }
        break;
      }
      default:
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    // Validar campos requeridos
    //cedula 10 digitos 
    const ciOrPassportRegex = /^\d{10}$/;
   
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/; // Solo letras y espacios, mínimo 2
    const phoneRegex = /^\+?\d{7,15}$/; // Solo números, opcional +, 7-15 dígitos
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/; // Formato estándar
    const countryRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/; // Solo letras y espacios, mínimo 2
    const professionRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/; // Solo letras y espacios, mínimo 2
    const institutionRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/;



    if (!ciOrPassportRegex.test(formData.ciOrPassport)) {
      setMessage({ text: 'La cédula debe tener 10 dígitos', type: 'error' });
      setIsSubmitting(false);
      return;
    }
    
    if (!nameRegex.test(formData.fullName)) {
      setMessage({ text: 'Nombres: solo letras y espacios, mínimo 2 caracteres.', type: 'error' });
      setIsSubmitting(false);
      return;
    }
    if (!nameRegex.test(formData.lastName)) {
      setMessage({ text: 'Apellidos: solo letras y espacios, mínimo 2 caracteres.', type: 'error' });
      setIsSubmitting(false);
      return;
    }
    if (!phoneRegex.test(formData.phoneNumber)) {
      setMessage({ text: 'Teléfono: solo números, entre 7 y 15 dígitos, puede iniciar con +.', type: 'error' });
      setIsSubmitting(false);
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setMessage({ text: 'Correo: formato inválido.', type: 'error' });
      setIsSubmitting(false);
      return;
    }
    if (!countryRegex.test(formData.country)) {
      setMessage({ text: 'País: solo letras y espacios, mínimo 2 caracteres.', type: 'error' });
      setIsSubmitting(false);
      return;
    }
    if (!professionRegex.test(formData.profession)) {
      setMessage({ text: 'Profesión: solo letras y espacios, mínimo 2 caracteres.', type: 'error' });
      setIsSubmitting(false);
      return;
    }
    if (!institutionRegex.test(formData.institution)) {
      setMessage({ text: 'Institución: solo letras y espacios, mínimo 2 caracteres.', type: 'error' });
      setIsSubmitting(false);
      return;
    }
   

    try {
      const response = await axios.post('http://localhost:4000/api/form-data', formData, {
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
        <img src="/logo__cepeige.png" alt="Logo del formulario" className="h-45" />
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
        <Input label="Cédula o Pasaporte" name="ciOrPassport" value={formData.ciOrPassport} handleChange={handleChange} handleBlur={handleBlur} error={fieldErrors.ciOrPassport} />
        <Input label="Nombres" name="fullName" value={formData.fullName} handleChange={handleChange} handleBlur={handleBlur} error={fieldErrors.fullName} />
        <Input label="Apellidos" name="lastName" value={formData.lastName} handleChange={handleChange} handleBlur={handleBlur} error={fieldErrors.lastName} />
        <Input label="Teléfono" name="phoneNumber" value={formData.phoneNumber} handleChange={handleChange} handleBlur={handleBlur} error={fieldErrors.phoneNumber} />
        <Input label="Correo Electrónico" name="email" value={formData.email} type="email" handleChange={handleChange} handleBlur={handleBlur} error={fieldErrors.email} />
        <Input label="País" name="country" value={formData.country} handleChange={handleChange} handleBlur={handleBlur} error={fieldErrors.country} />
        <Input label="Ciudad o Provincia" name="cityOrProvince" value={formData.cityOrProvince} handleChange={handleChange} handleBlur={handleBlur} error={fieldErrors.cityOrProvince} />
        <Input label="Profesión" name="profession" value={formData.profession} handleChange={handleChange} handleBlur={handleBlur} error={fieldErrors.profession} />
        <Input label="Institución" name="institution" value={formData.institution} handleChange={handleChange} handleBlur={handleBlur} error={fieldErrors.institution} />

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
  handleBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
};

const Input = ({ label, name, value, handleChange, handleBlur, error, type = "text" }: InputProps) => {
  // Definir ejemplos para cada campo
  const placeholders: Record<string, string> = {
    ciOrPassport: " 1004228621 o 2AB123456",
    fullName: "Juan Carlos",
    lastName: " Pérez López",
    phoneNumber: " 0991234567",
    email: " juan@email.com",
    country: " Ecuador",
    cityOrProvince: " Quito",
    profession: "Ingeniero",
    institution: " Universidad Central"
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        placeholder={placeholders[name] || ""}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-black "
      />
      {error && <span className="text-red-600 text-xs mt-1 block">{error}</span>}
    </div>
  );
};

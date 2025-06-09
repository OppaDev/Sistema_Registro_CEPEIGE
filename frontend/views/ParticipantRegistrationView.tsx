// views/ParticipantRegistrationView.tsx
"use client";

import { useState } from 'react';
import { Participant, FormMessage, FieldErrors } from '@/models/participant';
import { ParticipantController } from '@/controllers/ParticipantController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormInput } from './components/FormInput';

const initialFormData: Participant = {
  ciOrPassport: '',
  fullName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  country: '',
  cityOrProvince: '',
  profession: '',
  institution: ''
};

export default function ParticipantRegistrationView() {
  const [formData, setFormData] = useState<Participant>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Instanciar controlador
  const controller = new ParticipantController(
    setFormData,
    setMessage,
    setFieldErrors,
    setIsSubmitting
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await controller.submitForm(formData);
  };

  const handleChange = (name: string, value: string) => {
    controller.handleFieldChange(name, value);
  };

  const handleBlur = (name: string, value: string) => {
    controller.validateField(name, value);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <img src="/logo__cepeige.png" alt="Logo CEPEIGE" className="h-20" />
      </div>

      <Card>
        <CardHeader className="bg-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl">
            Formulario de Inscripción
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 bg-orange-50">
          {message && (
            <Alert className={`mb-4 ${
              message.type === 'success' 
                ? 'border-green-500 bg-green-50 text-green-800' 
                : 'border-red-500 bg-red-50 text-red-800'
            }`}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <FormInput
              label="Cédula o Pasaporte"
              name="ciOrPassport"
              value={formData.ciOrPassport}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldErrors.ciOrPassport}
            />
            
            <FormInput
              label="Nombres"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldErrors.fullName}
            />

            {/* Resto de campos... */}
            <FormInput
              label="Apellidos"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldErrors.lastName}
            />
            <FormInput
              label="Teléfono"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldErrors.phoneNumber}
            />
            <FormInput
              label="Correo Electrónico"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldErrors.email}
              type="email"
            />
            <FormInput
              label="País"
              name="country"
              value={formData.country}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldErrors.country}
            />
            <FormInput
              label="Ciudad o Provincia"
              name="cityOrProvince"
              value={formData.cityOrProvince}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldErrors.cityOrProvince}
            />
            <FormInput
              label="Profesión"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldErrors.profession}
            />
            <FormInput
              label="Institución"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldErrors.institution}
            />
            {/* Botón de envío */}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

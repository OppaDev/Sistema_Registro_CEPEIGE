// views/ParticipantRegistrationView.tsx (actualizada para usar la clase)
"use client";

import { useParticipantForm } from '@/controllers/useParticipantForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormInput } from './components/FormInput';
import { CourseSelector } from './components/CourseSelector';

export default function ParticipantRegistrationView() {
  const {
    formData,
    isSubmitting,
    message,
    fieldErrors,
    validateField,
    handleFieldChange,
    handleCourseSelect,
    submitForm,
    isFormValid
  } = useParticipantForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const handleChange = (name: string, value: string) => {
    handleFieldChange(name, value);
  };

  const handleBlur = (name: string, value: string) => {
    validateField(name, value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src="/logo__cepeige.png" alt="Logo CEPEIGE" className="h-24" />
      </div>

      {/* Título Principal */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Sistema de Registro CEPEIGE
        </h1>
        <p className="text-gray-600">
          Complete el formulario para inscribirse en nuestros cursos
        </p>
      </div>

      {/* Mensaje Global */}
      {message && (
        <Alert className={`mb-6 ${
          message.type === 'success' 
            ? 'border-green-500 bg-green-50 text-green-800' 
            : message.type === 'error'
            ? 'border-red-500 bg-red-50 text-red-800'
            : 'border-blue-500 bg-blue-50 text-blue-800'
        }`}>
          <AlertDescription className="font-medium">{message.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PASO 1: Selección de Curso */}
        <CourseSelector
          selectedCourse={formData.selectedCourse}
          onCourseSelect={handleCourseSelect}
          error={fieldErrors.selectedCourse}
        />

        {/* PASO 2: Datos Personales */}
        <Card>
          <CardHeader className="bg-blue-500 text-white">
            <CardTitle className="text-center text-xl">
              👤 Datos Personales
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 bg-blue-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Cédula o Pasaporte *"
                name="ciOrPassport"
                value={formData.ciOrPassport}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.ciOrPassport}
              />
              
              <FormInput
                label="Nombres *"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.fullName}
              />

              <FormInput
                label="Apellidos *"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.lastName}
              />

              <FormInput
                label="Teléfono *"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.phoneNumber}
              />

              <FormInput
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.email}
              />

              <FormInput
                label="País *"
                name="country"
                value={formData.country}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.country}
              />

              <FormInput
                label="Ciudad/Provincia *"
                name="cityOrProvince"
                value={formData.cityOrProvince}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.cityOrProvince}
              />

              <FormInput
                label="Profesión *"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.profession}
              />

              <div className="md:col-span-2">
                <FormInput
                  label="Institución *"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.institution}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen y Envío */}
        {formData.selectedCourse && (
          <Card>
            <CardHeader className="bg-green-500 text-white">
              <CardTitle className="text-center text-xl">
                📋 Resumen de Inscripción
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {formData.selectedCourse.courseName}
                    </h3>
                    <p className="text-gray-600">
                      Participante: {formData.fullName} {formData.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${formData.selectedCourse.coursePrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botón de Envío */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.selectedCourse}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-semibold"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Procesando...
              </>
            ) : (
              <>
                <span className="mr-2">📝</span>
                Completar Inscripción
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

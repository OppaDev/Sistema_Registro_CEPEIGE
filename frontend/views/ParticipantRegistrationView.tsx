// views/ParticipantRegistrationView.tsx (actualizada)
"use client";

import { useParticipantController } from '@/controllers/useParticipantController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormInput } from './components/FormInput';
import { CourseView } from './CourseView';

export default function ParticipantRegistrationView() {
  const {
    formData,
    isSubmitting,
    message,
    fieldErrors,
    validateField,
    handleFieldChange,
    handleCourseSelect,
    submitForm
  } = useParticipantController();

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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img src="/logo__cepeige.png" alt="Logo CEPEIGE" className="h-24" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sistema de Registro CEPEIGE
          </h1>
          <p className="text-lg text-gray-600">
            Complete el formulario para inscribirse en nuestros cursos especializados
          </p>
        </div>
      </div>

      {/* Mensaje Global */}
      {message && (
        <Alert className={`${
          message.type === 'success' 
            ? 'border-green-500 bg-green-50 text-green-800' 
            : message.type === 'error'
            ? 'border-red-500 bg-red-50 text-red-800'
            : 'border-blue-500 bg-blue-50 text-blue-800'
        }`}>
          <AlertDescription className="font-medium text-center">
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PASO 1: Selección de Curso */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-4">
            <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
            <h2 className="text-xl font-semibold text-gray-800">Selecciona tu curso</h2>
          </div>
          
          <CourseView
            onCourseSelect={handleCourseSelect}
            selectedCourseId={formData.selectedCourse?.courseId}
            error={fieldErrors.selectedCourse}
          />
        </div>

        {/* PASO 2: Datos Personales */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-4">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
            <h2 className="text-xl font-semibold text-gray-800">Completa tus datos</h2>
          </div>

          <Card>
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle className="text-center text-xl">
                👤 Información Personal
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* PASO 3: Confirmación y Envío */}
        {formData.selectedCourse && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
              <h2 className="text-xl font-semibold text-gray-800">Confirma tu inscripción</h2>
            </div>

            <Card>
              <CardHeader className="bg-green-500 text-white">
                <CardTitle className="text-center text-xl">
                  📋 Resumen de Inscripción
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl text-gray-800">
                        {formData.selectedCourse.courseName}
                      </h3>
                      <p className="text-gray-600">
                        <span className="font-medium">Participante:</span> {formData.fullName} {formData.lastName}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {formData.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        ${formData.selectedCourse.coursePrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">USD</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Botón de Envío */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.selectedCourse}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-4 text-lg font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-3">⏳</span>
                Procesando inscripción...
              </>
            ) : (
              <>
                <span className="mr-3">🚀</span>
                Completar Inscripción
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

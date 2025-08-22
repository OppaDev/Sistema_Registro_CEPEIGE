// views/ParticipantRegistrationView.tsx - VERSIÓN COMPLETA ACTUALIZADA
"use client";

import Image from 'next/image';
import { useParticipantController } from '@/controllers/inscripcion/useParticipantController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormInput } from './components/inscripcion/FormInput';
import { BillingForm } from './components/inscripcion/BillingForm';
import { PaymentReceiptUpload } from './components/inscripcion/PaymentReceiptUpload';
import CourseView from './CourseView';

export default function ParticipantRegistrationView() {
  const {
    formData,
    billingData,
    paymentData,
    currentStep,
    isSubmitting,
    message,
    fieldErrors,
    billingErrors,
    paymentErrors,
    validateField,
    validateBillingField,
    handleFieldChange,
    handleBillingChange,
    handlePaymentFileChange,
    handleCourseSelect,
    submitPersonalData,
    submitBillingData,
    submitPaymentReceipt,
    goToStep,
    resetForm,
    handleAutocomplete,
    autocompleteBillingData
  } = useParticipantController();

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitPersonalData();
  };

  const handleChange = (name: string, value: string) => {
    handleFieldChange(name, value);
  };

  const handleBlur = (name: string, value: string) => {
    validateField(name, value);
  };

  const handleBillingChangeWrapper = (name: string, value: string) => {
    handleBillingChange(name, value);
  };

  const handleBillingBlur = (name: string, value: string) => {
    validateBillingField(name, value);
  };

  // Función para obtener el estilo del paso
  const getStepStyle = (step: string) => {
    const stepOrder = ['course', 'personal', 'billing', 'payment', 'summary'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) {
      return 'bg-orange-600 text-white';  // Completado
    } else if (stepIndex === currentIndex) {
      return 'bg-blue-600 text-white'; // Actual
    } else {
      return 'bg-orange-600 text-white'; // Pendiente
    }
  };

  const getConnectorStyle = (step: string) => {
    const stepOrder = ['course', 'personal', 'billing', 'payment'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    return stepIndex < currentIndex ? 'bg-green-600 w-full' : 'bg-gray-300 w-0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Image 
              src="/Logo__cepeige.png" 
              alt="Logo CEPEIGE" 
              width={96} 
              height={96} 
              className="h-16 sm:h-20 lg:h-24 w-auto" 
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 px-4">
              Sistema de Registro CEPEIGE
            </h1>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Complete el proceso de inscripción paso a paso
            </p>
          </div>
        </div>

        {/* Indicador de pasos - ACTUALIZAR */}
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-8 overflow-x-auto">
          {/* Paso 1: Curso */}
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${getStepStyle('course')}`}>
              1
            </div>
            <span className="hidden sm:block font-medium text-xs">Curso</span>
          </div>
          
          <div className="w-4 sm:w-8 h-1 bg-gray-300 rounded relative overflow-hidden">
            <div className={`h-full rounded transition-all duration-500 ${getConnectorStyle('course')}`}></div>
          </div>
          
          {/* Paso 2: Datos Personales */}
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${getStepStyle('personal')}`}>
              2
            </div>
            <span className="hidden sm:block font-medium text-xs">Personal</span>
          </div>
                <div className="w-4 sm:w-8 h-1 bg-gray-300 rounded relative overflow-hidden">
            <div className={`h-full rounded transition-all duration-500 ${getConnectorStyle('personal')}`}></div>
          </div>
          
          {/* Paso 3: Facturación */}
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${getStepStyle('billing')}`}>
              3
            </div>
            <span className="hidden sm:block font-medium text-xs">Facturación</span>
          </div>
          
          <div className="w-4 sm:w-8 h-1 bg-gray-300 rounded relative overflow-hidden">
            <div className={`h-full rounded transition-all duration-500 ${getConnectorStyle('billing')}`}></div>
          </div>
          
          {/* Paso 4: Comprobante */}
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${getStepStyle('payment')}`}>
              4
            </div>
            <span className="hidden sm:block font-medium text-xs">Comprobante</span>
          </div>
          
          <div className="w-4 sm:w-8 h-1 bg-gray-300 rounded relative overflow-hidden">
            <div className={`h-full rounded transition-all duration-500 ${getConnectorStyle('payment')}`}></div>
          </div>
          
          {/* Paso 5: Resumen */}
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${getStepStyle('summary')}`}>
              5
            </div>
            <span className="hidden sm:block font-medium text-xs">Resumen</span>
          </div>
        </div>

        {/* Mensaje Global */}
        {message && (
          <Alert className={`transition-all duration-300 ${
            message.type === 'success' 
              ? 'border-green-500 bg-green-50 text-green-800' 
              : message.type === 'error'
              ? 'border-red-500 bg-red-50 text-red-800'
              : 'border-blue-500 bg-blue-50 text-blue-800'
          }`}>
            <AlertDescription className="font-medium text-center">
              {message.text}
            </AlertDescription>
            {/* 🆕 Botón para regresar a selección de curso si hay error de inscripción duplicada */}
            {message.type === 'error' && (message.text.includes('ya está inscrita en el curso') || message.text.includes('ya está inscrito en el curso')) && (
              <div className="mt-3 flex justify-center">
                <Button
                  onClick={() => goToStep('course')}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  ← Seleccionar Otro Curso
                </Button>
              </div>
            )}
          </Alert>
        )}

        {/* PASO 1: Selección de Curso */}
        {currentStep === 'course' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
              <h2 className="text-xl font-semibold text-gray-800">Selecciona tu curso</h2>
            </div>
            {/* Mostrar cursos disponibles */}
            <CourseView
              onCourseSelect={handleCourseSelect}
              selectedCourseId={formData.selectedCourse?.courseId}
            />
          </div>
        )}

        {/* PASO 2: Datos Personales */}
        {currentStep === 'personal' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
              <h2 className="text-xl font-semibold text-gray-800">Completa tus datos personales</h2>
            </div>

            <form onSubmit={handlePersonalSubmit}>
              <Card>
                <CardHeader className="bg-blue-500 text-white">
                  <CardTitle className="text-center text-xl">
                    👤 Información Personal
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 bg-blue-50">
                  {/* Mensaje legal de protección de datos */}
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="text-yellow-600 mt-0.5">⚖️</div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Protección de Datos Personales
                        </h4>
                        <p className="text-sm text-yellow-700 leading-relaxed">
                          En conformidad con lo establecido en la <strong>Ley Orgánica de Protección de Datos Personales</strong> (en adelante, &ldquo;LOPD&rdquo;) 
                          y demás normativa pertinente, se recopilarán y procesarán los siguientes datos personales, 
                          los cuales han sido proporcionados voluntariamente, tal como se detalla a continuación:
                        </p>
                        <p className="text-sm text-yellow-700 mt-2 font-medium">
                          <strong>Datos personales:</strong> Si ya tiene registros previos, puede autocompletar los datos o actualizarlos manualmente. 
                          Los cambios en la información se aplicarán a su registro para futuras inscripciones.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Funcionalidad de autocompletado con consentimiento */}
                  {formData.ciPasaporte && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="consentimiento-datos"
                          className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="consentimiento-datos" className="text-sm text-blue-800">
                          <strong>Autorizo el uso de mis datos personales previos:</strong> Al marcar esta casilla, 
                          doy mi consentimiento explícito e informado para que se recuperen y utilicen mis datos 
                          personales de registros anteriores con el propósito de autocompletar este formulario. 
                          Entiendo que esta acción es voluntaria y puedo completar el formulario manualmente.
                        </label>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => {
                            const checkbox = document.getElementById('consentimiento-datos') as HTMLInputElement;
                            const hasConsent = checkbox?.checked || false;
                            handleAutocomplete(hasConsent);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>Buscando...</span>
                            </div>
                          ) : (
                            '🔄 Autocompletar Datos'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormInput
                      label="Cédula o Pasaporte *"
                      name="ciPasaporte"
                      value={formData.ciPasaporte}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.ciPasaporte}
                    />
                    
                    <FormInput
                      label="Nombres *"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.nombres}
                    />

                    <FormInput
                      label="Apellidos *"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.apellidos}
                    />

                    <FormInput
                      label="Teléfono *"
                      name="numTelefono"
                      value={formData.numTelefono}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.numTelefono}
                    />

                    <FormInput
                      label="Email *"
                      name="correo"
                      type="email"
                      value={formData.correo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.correo}
                    />

                    <FormInput
                      label="País *"
                      name="pais"
                      value={formData.pais}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.pais}
                    />

                    <FormInput
                      label="Provincia/Estado *"
                      name="provinciaEstado"
                      value={formData.provinciaEstado}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.provinciaEstado}
                    />

                    <FormInput
                      label="Ciudad *"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.ciudad}
                    />

                    <FormInput
                      label="Profesión *"
                      name="profesion"
                      value={formData.profesion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.profesion}
                    />

                    <div className="sm:col-span-2">
                      <FormInput
                        label="Institución *"
                        name="institucion"
                        value={formData.institucion}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldErrors.institucion}
                      />
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                   {/* <Button
                      type="button"
                      onClick={() => goToStep('course')}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      ← Volver a Selección de Curso
                    </Button>*/}
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.selectedCourse}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Guardando...</span>
                        </div>
                      ) : (
                        'Continuar a Facturación →'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        )}

        {/* PASO 3: Datos de Facturación */}
        {currentStep === 'billing' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
              <h2 className="text-xl font-semibold text-gray-800">Datos de facturación</h2>
            </div>

            <BillingForm
              billingData={billingData}
              billingErrors={billingErrors}
              isSubmitting={isSubmitting}
              onBillingChange={handleBillingChangeWrapper}
              onBillingBlur={handleBillingBlur}
              onSubmit={submitBillingData}
              onAutocomplete={autocompleteBillingData}
            />
          </div>
        )}

        {/* PASO 4: Comprobante de Pago */}
        {currentStep === 'payment' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</span>
              <h2 className="text-xl font-semibold text-gray-800">Comprobante de pago</h2>
            </div>

            <PaymentReceiptUpload
              paymentData={paymentData}
              paymentErrors={paymentErrors}
              isSubmitting={isSubmitting}
              selectedCourse={formData.selectedCourse}
              onFileChange={handlePaymentFileChange}
              onSubmit={submitPaymentReceipt}
            />
          </div>
        )}

        {/* PASO 5: Resumen Final */}
        {currentStep === 'summary' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">5</span>
              <h2 className="text-xl font-semibold text-gray-800">Resumen de inscripción</h2>
            </div>

            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="text-center text-2xl font-bold">
                  🎉 ¡Inscripción Completada!
                </CardTitle>
                <p className="text-center text-green-100 mt-2">
                  Tu registro ha sido procesado exitosamente
                </p>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                {/* Resumen del curso */}
                {formData.selectedCourse && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-orange-800 flex items-center">
                      📚 Curso Seleccionado
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-800">{formData.selectedCourse.courseName}</p>
                        <p className="text-2xl font-bold text-orange-600">
                          ${formData.selectedCourse.coursePrice.toFixed(2)} USD
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Datos personales */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-blue-800 flex items-center">
                    👤 Datos Personales
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Nombre:</span> {formData.nombres} {formData.apellidos}</p>
                      <p><span className="font-medium">CI/Pasaporte:</span> {formData.ciPasaporte}</p>
                      <p><span className="font-medium">Email:</span> {formData.correo}</p>
                      <p><span className="font-medium">Teléfono:</span> {formData.numTelefono}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">País:</span> {formData.pais}</p>
                      <p><span className="font-medium">Provincia:</span> {formData.provinciaEstado}</p>
                      <p><span className="font-medium">Ciudad:</span> {formData.ciudad}</p>
                      <p><span className="font-medium">Profesión:</span> {formData.profesion}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p><span className="font-medium">Institución:</span> {formData.institucion}</p>
                    </div>
                  </div>
                </div>

                {/* Datos de facturación */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-purple-800 flex items-center">
                    🧾 Datos de Facturación
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Razón Social:</span> {billingData.razonSocial}</p>
                      <p><span className="font-medium">ID Tributaria:</span> {billingData.identificacionTributaria}</p>
                      <p><span className="font-medium">Teléfono:</span> {billingData.telefono}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Email Facturación:</span> {billingData.correoFactura}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p><span className="font-medium">Dirección:</span> {billingData.direccion}</p>
                    </div>
                  </div>
                </div>

                {/* Comprobante de pago */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-green-800 flex items-center">
                    💳 Comprobante de Pago
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {paymentData.tipoArchivo?.startsWith('image/') ? '🖼️' : '📄'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {paymentData.nombreArchivo || paymentData.file?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Subido: {paymentData.fechaSubida ? 
                          new Date(paymentData.fechaSubida).toLocaleString('es-ES') : 
                          'Recién subido'
                        }
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        ✅ Comprobante recibido correctamente
                      </p>
                    </div>
                  </div>
                </div>

                {/* Próximos pasos */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-yellow-800 flex items-center">
                    📋 Próximos Pasos
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Nuestro equipo verificará tu comprobante de pago (24-48 horas)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>Recibirás un correo de confirmación una vez verificado el pago</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>Te enviaremos las credenciales de acceso y el enlace el grupo del curso Asignado - Telegram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>Te enviaremos la factura oficial </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">5.</span>
                      <span>Nos contactaremos contigo antes del inicio del curso</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">6.</span>
                      <span>Si tienes dudas, contáctanos al correo: info@cepeige.org</span>
                    </li>
                  </ul>
                </div>

                {/* Botones finales */}
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {/*<Button
                    onClick={() => goToStep('payment')}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    ← Modificar Comprobante
                  </Button>*/}
                  
                  <Button
                    onClick={resetForm}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
                  >
                    🆕 Nueva Inscripción
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
  
}


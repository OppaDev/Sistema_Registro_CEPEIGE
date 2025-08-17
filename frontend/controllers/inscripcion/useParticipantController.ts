// controllers/useParticipantController.ts - VERSIÓN COMPLETA ACTUALIZADA
import { useState } from 'react';
import { Participant, FormMessage, FieldErrors } from '@/models/inscripcion/participant';
import { BillingData, billingSchema, BillingFieldErrors } from '@/models/inscripcion/billing';
import { PaymentReceipt, paymentReceiptSchema, PaymentFieldErrors } from '@/models/inscripcion/payment';
import { Course } from '@/models/inscripcion/course';
import { participantSchema } from '@/models/validation';
import { participantService } from '@/services/inscripcion/participantService';
import { billingService } from '@/services/inscripcion/billingService';
import { paymentService } from '@/services/inscripcion/paymentService';
import { inscriptionService } from '@/services/inscripcion_completa/inscriptionService'; // 🆕 NUEVA IMPORTACIÓN

export type RegistrationStep = 'course' | 'personal' | 'billing' | 'payment' | 'summary';

interface ParticipantResponseData {
  idPersona: number;
  nombres: string;
  apellidos: string;
  correo: string;
  numTelefono: string;
  ciPasaporte: string;
  pais: string;
  provinciaEstado: string;
  ciudad: string;
  profesion: string;
  institucion: string;
}

interface BillingResponseData {
  idFacturacion: number;
  razonSocial: string;
  identificacionTributaria: string;
  telefono: string;
  correoFactura: string;
  direccion: string;
}

const initialFormData: Participant = {
  selectedCourse: undefined,
  ciPasaporte: '',
  nombres: '',
  apellidos: '',
  numTelefono: '',
  correo: '',
  pais: '',
  provinciaEstado: '',
  ciudad: '',
  profesion: '',
  institucion: ''
};

const initialBillingData: BillingData = {
  razonSocial: '',
  identificacionTributaria: '',
  telefono: '',
  correoFactura: '',
  direccion: ''
};

const initialPaymentData: PaymentReceipt = {
  file: undefined
};

export function useParticipantController() {
  const [formData, setFormData] = useState<Participant>(initialFormData);
  const [billingData, setBillingData] = useState<BillingData>(initialBillingData);
  const [paymentData, setPaymentData] = useState<PaymentReceipt>(initialPaymentData);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('course');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [billingErrors, setBillingErrors] = useState<BillingFieldErrors>({});
  const [paymentErrors, setPaymentErrors] = useState<PaymentFieldErrors>({});
  
  // 🆕 ESTADOS ACTUALIZADOS CON NOMBRES CORRECTOS
  const [personalDataId, setPersonalDataId] = useState<number | null>(null);
  const [billingDataId, setBillingDataId] = useState<number | null>(null);
  const [uploadedReceiptId, setUploadedReceiptId] = useState<number | null>(null);

  const validateField = (name: string, value: string): void => {
    try {
      if (name === 'selectedCourse') return;
      
      participantSchema.shape[name as keyof typeof participantSchema.shape].parse(value);
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    } catch (error: unknown) {
      const zodError = error as { errors?: Array<{ message?: string }> };
      setFieldErrors(prev => ({ 
        ...prev, 
        [name]: zodError.errors?.[0]?.message || 'Campo inválido' 
      }));
    }
  };

  const validateBillingField = (name: string, value: string): void => {
    try {
      billingSchema.shape[name as keyof typeof billingSchema.shape].parse(value);
      setBillingErrors(prev => ({ ...prev, [name]: '' }));
    } catch (error: unknown) {
      const zodError = error as { errors?: Array<{ message?: string }> };
      setBillingErrors(prev => ({ 
        ...prev, 
        [name]: zodError.errors?.[0]?.message || 'Campo inválido' 
      }));
    }
  };

  const handleFieldChange = (name: string, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBillingChange = (name: string, value: string): void => {
    setBillingData(prev => ({ ...prev, [name]: value }));
    setBillingErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCourseSelect = (course: Course) => {
    console.log('🎯 Curso seleccionado:', course);
    
    setFormData(prev => ({
      ...prev,
      selectedCourse: {
        courseId: course.idCurso,
        courseName: course.nombreCurso,
        coursePrice: course.valorCurso
      }
    }));
    
    setFieldErrors(prev => ({
      ...prev,
      selectedCourse: ''
    }));
    
    setMessage({
      text: `✅ Curso "${course.nombreCurso}" seleccionado correctamente`,
      type: 'success'
    });

    // Auto avanzar al siguiente paso
    setTimeout(() => {
      setCurrentStep('personal');
    }, 1000);
  };

  // 🆕 Función para verificar inscripción duplicada
  const checkForDuplicateEnrollment = async (ciPasaporte: string, courseId: number, courseName: string): Promise<boolean> => {
    try {
      console.log(`🔍 Verificando inscripción duplicada: CI=${ciPasaporte}, Curso=${courseId}`);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${API_BASE_URL}/inscripciones?page=1&limit=100&_t=${Date.now()}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('⚠️ No se pudo verificar inscripciones, continuando...');
        return false;
      }

      const data = await response.json();
      if (!data.success || !data.data) {
        console.log('✅ No hay inscripciones, puede proceder');
        return false;
      }

      // Buscar inscripción duplicada
      const duplicate = data.data.find((inscription: { 
        datosPersonales: { ciPasaporte: string }; 
        curso: { idCurso: number } 
      }) => 
        inscription.datosPersonales.ciPasaporte === ciPasaporte && 
        inscription.curso.idCurso === courseId
      );

      if (duplicate) {
        console.log('❌ Inscripción duplicada encontrada:', duplicate);
        
        const errorMessage = `La persona con cédula/pasaporte "${ciPasaporte}" ya está inscrita en el curso: "${courseName}". ` +
          `Su inscripción fue registrada el ${new Date(duplicate.fechaInscripcion).toLocaleDateString('es-ES')}. ` +
          `Para inscribirse en un curso diferente, seleccione otro curso.`;
        
        setMessage({
          text: errorMessage,
          type: 'error'
        });
        
        return true; // Duplicada encontrada
      }

      console.log('✅ No se encontró inscripción duplicada');
      return false; // No duplicada
    } catch (error) {
      console.error('Error verificando inscripción:', error);
      return false; // En caso de error, permitir continuar
    }
  };

  const submitPersonalData = async (): Promise<void> => {
    console.log('🚀 === EJECUTANDO submitPersonalData ===');
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Validar datos personales
      participantSchema.parse(formData);
      
      // 🆕 VALIDACIÓN DE INSCRIPCIÓN DUPLICADA - PASO 2
      console.log('📋 Datos actuales:', {
        selectedCourse: formData.selectedCourse,
        ciPasaporte: formData.ciPasaporte
      });
      
      if (formData.selectedCourse && formData.ciPasaporte.trim()) {
        // Validar que la cédula tenga al menos 10 dígitos antes de buscar
        if (formData.ciPasaporte.trim().length < 10) {
          console.log('⚠️ Cédula muy corta, omitiendo validación de duplicados');
        } else {
          console.log('✅ Iniciando validación de inscripción duplicada...');
          const isDuplicate = await checkForDuplicateEnrollment(
            formData.ciPasaporte,
            formData.selectedCourse.courseId,
            formData.selectedCourse.courseName
          );
          
          if (isDuplicate) {
            setIsSubmitting(false);
            return; // DETENER PROCESO AQUÍ
          }
        }
      }
      
      // Enviar datos personales
      const response = await participantService.register(formData);
      
      if (response.success) {
        const responseData = response.data as ParticipantResponseData;
        setPersonalDataId(responseData.idPersona); // 🆕 NOMBRE CORRECTO
        setMessage({
          text: '✅ Datos personales registrados correctamente',
          type: 'success'
        });
        
        // Avanzar al siguiente paso
        setTimeout(() => {
          setCurrentStep('billing');
        }, 1000);
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error: unknown) {
      const errorObj = error as { 
        errors?: Array<{ message?: string }>; 
        message?: string 
      };
      if (errorObj.errors) {
        const firstError = errorObj.errors[0];
        setMessage({
          text: firstError?.message || 'Por favor, revisa los datos ingresados',
          type: 'error'
        });
      } else {
        setMessage({
          text: errorObj.message || 'Error al procesar el registro. Intenta nuevamente.',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitBillingData = async (): Promise<void> => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      billingSchema.parse(billingData);
      
      const response = await billingService.create(billingData);
      
      if (response.success) {
        const billingResponseData = response.data as BillingResponseData;
        setBillingDataId(billingResponseData.idFacturacion); // 🆕 NOMBRE CORRECTO
        setMessage({
          text: '✅ Datos de facturación registrados correctamente',
          type: 'success'
        });
        
        // Avanzar al paso de comprobante
        setTimeout(() => {
          setCurrentStep('payment');
        }, 1000);
      } else {
        throw new Error(response.message || 'Error en el registro de facturación');
      }
    } catch (error: unknown) {
      const errorObj = error as { 
        errors?: Array<{ message?: string }>; 
        message?: string 
      };
      if (errorObj.errors) {
        const firstError = errorObj.errors[0];
        setMessage({
          text: firstError?.message || 'Por favor, revisa los datos de facturación',
          type: 'error'
        });
      } else {
        setMessage({
          text: errorObj.message || 'Error al procesar los datos de facturación',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentFileChange = (file: File | null): void => {
    if (file) {
      // Validar archivo
      const validation = paymentService.validateFile(file);
      if (!validation.isValid) {
        setPaymentErrors({ file: validation.error || 'Archivo inválido' });
        return;
      }

      setPaymentData({ file });
      setPaymentErrors({ file: '' });
      setMessage({
        text: `✅ Archivo "${file.name}" seleccionado correctamente`,
        type: 'success'
      });
    } else {
      setPaymentData(initialPaymentData);
      setPaymentErrors({ file: 'Debe seleccionar un archivo' });
    }
  };

  // ...en el mismo archivo
const createCompleteInscriptionDirect = async (
  courseId: number | undefined,
  personaId: number | null,
  facturacionId: number | null,
  comprobanteId: number | undefined
) => {
  try {
    if (!courseId || !personaId || !facturacionId || !comprobanteId) {
      throw new Error('Faltan datos para crear la inscripción');
    }

    const inscriptionData = {
      idCurso: courseId,
      idPersona: personaId,
      idFacturacion: facturacionId,
      idComprobante: comprobanteId
    };

    const response = await inscriptionService.createInscription(inscriptionData);

    if (response.success) {
      setMessage({
        type: 'success',
        text: '¡Inscripción completada exitosamente! Te contactaremos pronto.'
      });
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error: unknown) {
    const errorObj = error as { message?: string };
    setMessage({
      type: 'error',
      text: errorObj.message || 'Error al completar la inscripción'
    });
    throw error;
  }
};

  // 🆕 FUNCIÓN ACTUALIZADA submitPaymentReceipt
  const submitPaymentReceipt = async (): Promise<void> => {
    if (!paymentData.file) {
      setPaymentErrors({ file: 'Debe seleccionar un archivo' });
      return;
    }

    try {
      setIsSubmitting(true);
      setPaymentErrors({});
      setMessage(null);

      // Validar archivo
      paymentReceiptSchema.parse({ file: paymentData.file });

      // Subir comprobante
      const uploadResponse = await paymentService.uploadReceipt(paymentData.file);
      
      if (uploadResponse.success && uploadResponse.data) {
        // Actualizar datos del comprobante
        setPaymentData(prev => ({
          ...prev,
          idComprobante: uploadResponse.data!.idComprobante,
          fechaSubida: uploadResponse.data!.fechaSubida,
          rutaComprobante: uploadResponse.data!.rutaComprobante,
          tipoArchivo: uploadResponse.data!.tipoArchivo,
          nombreArchivo: uploadResponse.data!.nombreArchivo
        }));

        setUploadedReceiptId(uploadResponse.data.idComprobante ?? null);

        // Crear inscripción completa
        //await createCompleteInscription();
        await createCompleteInscriptionDirect(
         formData.selectedCourse?.courseId,
          personalDataId,
          billingDataId,
          uploadResponse.data.idComprobante
        );
        
        // Ir al resumen
        setCurrentStep('summary');
      } else {
        throw new Error(uploadResponse.message || 'Error al subir el comprobante');
      }
    } catch (error: unknown) {
      console.error('❌ Error en submitPaymentReceipt:', error);
      
      const errorObj = error as { 
        errors?: Array<{ message?: string }>; 
        message?: string 
      };
      
      if (errorObj.errors) {
        const firstError = errorObj.errors[0];
        setMessage({
          text: firstError?.message || 'Por favor, revisa el archivo seleccionado',
          type: 'error'
        });
        setPaymentErrors({ file: firstError?.message || 'Archivo inválido' });
      } else {
        setMessage({
          text: errorObj.message || 'Error al procesar el comprobante de pago',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = (): void => {
    setFormData(initialFormData);
    setBillingData(initialBillingData);
    setPaymentData(initialPaymentData);
    setFieldErrors({});
    setBillingErrors({});
    setPaymentErrors({});
    setMessage(null);
    setCurrentStep('course');
    setPersonalDataId(null);
    setBillingDataId(null);
    setUploadedReceiptId(null);
  };

  const goToStep = (step: RegistrationStep): void => {
    setCurrentStep(step);
    setMessage(null);
  };

  // 🆕 Función para autocompletado con consentimiento
  const handleAutocomplete = async (hasConsent: boolean): Promise<void> => {
    if (!formData.ciPasaporte.trim()) {
      setMessage({
        text: 'Debe ingresar un CI/Pasaporte para poder autocompletar los datos',
        type: 'error'
      });
      return;
    }

    if (!hasConsent) {
      setMessage({
        text: 'Debe otorgar consentimiento explícito para autocompletar los datos',
        type: 'error'
      });
      return;
    }

    try {
      setMessage({ text: 'Buscando datos anteriores...', type: 'info' });
      
      const autocompleteResponse = await participantService.getDataForAutocomplete(
        formData.ciPasaporte, 
        hasConsent
      );

      if (autocompleteResponse.success && autocompleteResponse.data) {
        const existingData = autocompleteResponse.data as ParticipantResponseData;
        
        // Llenar el formulario con los datos encontrados, pero mantener el correo actual si se cambió
        const currentEmail = formData.correo.trim();
        const shouldKeepCurrentEmail = currentEmail && currentEmail !== existingData.correo;
        
        setFormData(prev => ({
          ...prev,
          nombres: existingData.nombres || prev.nombres,
          apellidos: existingData.apellidos || prev.apellidos,
          numTelefono: existingData.numTelefono || prev.numTelefono,
          // Lógica inteligente para el correo
          correo: shouldKeepCurrentEmail ? currentEmail : (existingData.correo || prev.correo),
          pais: existingData.pais || prev.pais,
          provinciaEstado: existingData.provinciaEstado || prev.provinciaEstado,
          ciudad: existingData.ciudad || prev.ciudad,
          profesion: existingData.profesion || prev.profesion,
          institucion: existingData.institucion || prev.institucion
        }));

        if (shouldKeepCurrentEmail) {
          setMessage({
            text: `✅ Datos autocompletados. Se mantuvo el correo actual (${currentEmail}) en lugar del registrado previamente (${existingData.correo})`,
            type: 'success'
          });
        } else {
          setMessage({
            text: '✅ Datos autocompletados exitosamente desde registros anteriores',
            type: 'success'
          });
        }
      } else {
        setMessage({
          text: 'ℹ️ No se encontraron datos anteriores para este CI/Pasaporte. Complete el formulario manualmente.',
          type: 'info'
        });
      }
    } catch (error: unknown) {
      console.error('Error en autocompletado:', error);
      setMessage({
        text: 'Error al buscar datos anteriores. Complete el formulario manualmente.',
        type: 'error'
      });
    }
  };

  return {
    // Estado
    formData,
    billingData,
    paymentData,
    currentStep,
    isSubmitting,
    message,
    fieldErrors,
    billingErrors,
    paymentErrors,
    personalDataId,      // 🆕 NOMBRE CORRECTO
    billingDataId,       // 🆕 NOMBRE CORRECTO
    uploadedReceiptId,
    
    // Acciones
    validateField,
    validateBillingField,
    handleFieldChange,
    handleBillingChange,
    handlePaymentFileChange,
    handleCourseSelect,
    submitPersonalData,
    submitBillingData,
    submitPaymentReceipt,
    resetForm,
    goToStep,
    handleAutocomplete // 🆕 Nueva función exportada
  };
}

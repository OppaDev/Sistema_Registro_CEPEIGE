// controllers/useParticipantController.ts - VERSIÓN COMPLETA ACTUALIZADA
import { useState } from 'react';
import { Participant, FormMessage, FieldErrors } from '@/models/participant';
import { BillingData, billingSchema, BillingFormMessage, BillingFieldErrors } from '@/models/billing';
import { PaymentReceipt, paymentReceiptSchema, PaymentFormMessage, PaymentFieldErrors } from '@/models/payment';
import { Course } from '@/models/course';
import { participantSchema } from '@/models/validation';
import { participantService } from '@/services/participantService';
import { billingService } from '@/services/billingService';
import { paymentService } from '@/services/paymentService';
import { inscriptionService } from '@/services/inscriptionService'; // 🆕 NUEVA IMPORTACIÓN

export type RegistrationStep = 'course' | 'personal' | 'billing' | 'payment' | 'summary';

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
    } catch (error: any) {
      setFieldErrors(prev => ({ 
        ...prev, 
        [name]: error.errors[0]?.message || 'Campo inválido' 
      }));
    }
  };

  const validateBillingField = (name: string, value: string): void => {
    try {
      billingSchema.shape[name as keyof typeof billingSchema.shape].parse(value);
      setBillingErrors(prev => ({ ...prev, [name]: '' }));
    } catch (error: any) {
      setBillingErrors(prev => ({ 
        ...prev, 
        [name]: error.errors[0]?.message || 'Campo inválido' 
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

  const submitPersonalData = async (): Promise<void> => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Validar datos personales
      participantSchema.parse(formData);
      
      // Enviar datos personales
      const response = await participantService.register(formData);
      
      if (response.success) {
        setPersonalDataId(response.data.idPersona); // 🆕 NOMBRE CORRECTO
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
    } catch (error: any) {
      if (error.errors) {
        const firstError = error.errors[0];
        setMessage({
          text: firstError?.message || 'Por favor, revisa los datos ingresados',
          type: 'error'
        });
      } else {
        setMessage({
          text: error.message || 'Error al procesar el registro. Intenta nuevamente.',
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
        setBillingDataId(response.data.idFacturacion); // 🆕 NOMBRE CORRECTO
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
    } catch (error: any) {
      if (error.errors) {
        const firstError = error.errors[0];
        setMessage({
          text: firstError?.message || 'Por favor, revisa los datos de facturación',
          type: 'error'
        });
      } else {
        setMessage({
          text: error.message || 'Error al procesar los datos de facturación',
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

  // 🆕 FUNCIÓN PARA CREAR INSCRIPCIÓN COMPLETA
  const createCompleteInscription = async () => {
    try {
      if (!formData.selectedCourse || !personalDataId || !billingDataId || !paymentData.idComprobante) {
        throw new Error('Faltan datos para crear la inscripción');
      }

      console.log('🚀 Creando inscripción completa:', {
        idCurso: formData.selectedCourse.courseId,
        idPersona: personalDataId,
        idFacturacion: billingDataId,
        idComprobante: paymentData.idComprobante
      });

      const inscriptionData = {
        idCurso: formData.selectedCourse.courseId,
        idPersona: personalDataId,
        idFacturacion: billingDataId,
        idComprobante: paymentData.idComprobante
      };

      const response = await inscriptionService.createInscription(inscriptionData);

      if (response.success) {
        console.log('✅ Inscripción creada exitosamente:', response.data);
        setMessage({
          type: 'success',
          text: '¡Inscripción completada exitosamente! Te contactaremos pronto.'
        });
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('❌ Error creando inscripción:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al completar la inscripción'
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
        await createCompleteInscription();
        
        // Ir al resumen
        setCurrentStep('summary');
      } else {
        throw new Error(uploadResponse.message || 'Error al subir el comprobante');
      }
    } catch (error: any) {
      console.error('❌ Error en submitPaymentReceipt:', error);
      
      if (error.errors) {
        const firstError = error.errors[0];
        setMessage({
          text: firstError?.message || 'Por favor, revisa el archivo seleccionado',
          type: 'error'
        });
        setPaymentErrors({ file: firstError?.message || 'Archivo inválido' });
      } else {
        setMessage({
          text: error.message || 'Error al procesar el comprobante de pago',
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
    goToStep
  };
}

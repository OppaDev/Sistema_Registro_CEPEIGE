// controllers/useParticipantController.ts - AGREGAR IMPORTS Y ESTADO
import { useState } from 'react';
import { Participant, FormMessage, FieldErrors } from '@/models/participant';
import { BillingData, billingSchema, BillingFormMessage, BillingFieldErrors } from '@/models/billing';
import { PaymentReceipt, paymentReceiptSchema, PaymentFormMessage, PaymentFieldErrors } from '@/models/payment';
import { Course } from '@/models/course';
import { participantSchema } from '@/models/validation';
import { participantService } from '@/services/participantService';
import { billingService } from '@/services/billingService';
import { paymentService } from '@/services/paymentService';

// AGREGAR ESTADO PARA PASOS Y FACTURACIÓN
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
  const [registeredParticipantId, setRegisteredParticipantId] = useState<number | null>(null);
  const [registeredBillingId, setRegisteredBillingId] = useState<number | null>(null);
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
        setRegisteredParticipantId(response.data.idPersona);
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

  const submitPaymentReceipt = async (): Promise<void> => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!paymentData.file) {
        throw new Error('Debe seleccionar un comprobante de pago');
      }

      // Validar archivo
      paymentReceiptSchema.parse({ file: paymentData.file });
      
      // Subir comprobante
      const response = await paymentService.uploadReceipt(paymentData.file);
      
      if (response.success && response.data) {
        setUploadedReceiptId(response.data.idComprobante || null);
        setPaymentData(prev => ({
          ...prev,
          ...response.data
        }));
        
        setMessage({
          text: '✅ Comprobante de pago subido correctamente',
          type: 'success'
        });
        
        // Avanzar al resumen final
        setTimeout(() => {
          setCurrentStep('summary');
        }, 1000);
      } else {
        throw new Error(response.message || 'Error al subir el comprobante');
      }
    } catch (error: any) {
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

   const submitBillingData = async (): Promise<void> => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      billingSchema.parse(billingData);
      
      const response = await billingService.create(billingData);
      
      if (response.success) {
        setRegisteredBillingId(response.data.idFacturacion);
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

  const resetForm = (): void => {
    setFormData(initialFormData);
    setBillingData(initialBillingData);
    setPaymentData(initialPaymentData);
    setFieldErrors({});
    setBillingErrors({});
    setPaymentErrors({});
    setMessage(null);
    setCurrentStep('course');
    setRegisteredParticipantId(null);
    setRegisteredBillingId(null);
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
    registeredParticipantId,
    registeredBillingId,
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

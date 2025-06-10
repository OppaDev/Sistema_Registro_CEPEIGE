// controllers/useParticipantController.ts (actualizado)
import { useState } from 'react';
import { Participant, FormMessage, FieldErrors } from '@/models/participant';
import { Course } from '@/models/course';
import { participantSchema } from '@/models/validation';
import { participantService } from '@/services/participantService';

const initialFormData: Participant = {
  selectedCourse: undefined,
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

export function useParticipantController() {
  const [formData, setFormData] = useState<Participant>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

  const handleFieldChange = (name: string, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCourseSelect = (course: Course): void => {
    const courseSelection = {
      courseId: course.idCurso,
      courseName: course.nombreCurso,
      coursePrice: course.valorCurso
    };
    
    setFormData(prev => ({ ...prev, selectedCourse: courseSelection }));
    setFieldErrors(prev => ({ ...prev, selectedCourse: '' }));
    setMessage(null);
  };

  const resetForm = (): void => {
    setFormData(initialFormData);
    setFieldErrors({});
    setMessage(null);
  };

  const submitForm = async (): Promise<void> => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Validar todos los campos
      participantSchema.parse(formData);
      
      // Enviar datos
      const response = await participantService.register(formData);
      
      setMessage({
        text: response.message || '¡Registro exitoso! Te contactaremos pronto.',
        type: 'success'
      });

      // Limpiar formulario después de éxito
      setTimeout(() => {
        resetForm();
      }, 2000);
      
    } catch (error: any) {
      if (error.errors) {
        const firstError = error.errors[0];
        setMessage({
          text: firstError?.message || 'Por favor, revisa los datos ingresados',
          type: 'error'
        });
        
        // Marcar errores específicos
        if (firstError?.path?.includes('selectedCourse')) {
          setFieldErrors(prev => ({ ...prev, selectedCourse: 'Debe seleccionar un curso' }));
        }
      } else {
        setMessage({
          text: error.response?.data?.message || 'Error al procesar el registro. Intenta nuevamente.',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Estado
    formData,
    isSubmitting,
    message,
    fieldErrors,
    
    // Acciones
    validateField,
    handleFieldChange,
    handleCourseSelect,
    submitForm,
    resetForm
  };
}

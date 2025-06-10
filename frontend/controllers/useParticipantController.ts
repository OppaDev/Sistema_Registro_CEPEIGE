// controllers/useParticipantController.ts (actualizado)
import { useState } from 'react';
import { Participant, FormMessage, FieldErrors } from '@/models/participant';
import { Course } from '@/models/course';
import { participantSchema } from '@/models/validation';
import { participantService } from '@/services/participantService';

const initialFormData: Participant = {
  selectedCourse: undefined,
  ciPasaporte: '',      // ✅ Cambio
  nombres: '',          // ✅ Cambio
  apellidos: '',        // ✅ Cambio
  numTelefono: '',      // ✅ Cambio
  correo: '',           // ✅ Cambio
  pais: '',             // ✅ Cambio
  provinciaEstado: '',  // ✅ Cambio
  ciudad: '',           // ✅ NUEVO
  profesion: '',        // ✅ Igual
  institucion: ''       // ✅ Igual
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

// controllers/useParticipantController.ts - ACTUALIZAR MÉTODO
const handleCourseSelect = (course: Course) => {
  console.log('🎯 Curso seleccionado:', course);
  
  setFormData(prev => ({
    ...prev,
    selectedCourse: {
      courseId: course.idCurso,        // ✅ Usar idCurso del backend
      courseName: course.nombreCurso,  // ✅ Usar nombreCurso del backend
      coursePrice: course.valorCurso   // ✅ Usar valorCurso del backend
    }
  }));
  
  // Limpiar error de selección de curso
  setFieldErrors(prev => ({
    ...prev,
    selectedCourse: ''
  }));
  
  setMessage({
    text: `✅ Curso "${course.nombreCurso}" seleccionado correctamente`,
    type: 'success'
  });
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

// controllers/useParticipantForm.ts (nuevo archivo)
import { useState, useMemo } from 'react';
import { Participant, FormMessage, FieldErrors } from '@/models/participant';
import { CourseSelection } from '@/models/course';
import { ParticipantController } from './ParticipantController';

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

export function useParticipantForm() {
  const [formData, setFormData] = useState<Participant>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Crear instancia del controller
  const controller = useMemo(() => {
    return new ParticipantController(
      setFormData,
      setMessage,
      setFieldErrors,
      setIsSubmitting
    );
  }, []);

  // Funciones que delegan al controller
  const validateField = (name: string, value: string) => {
    controller.validateField(name, value);
  };

  const handleFieldChange = (name: string, value: string) => {
    controller.handleFieldChange(name, value);
  };

  const handleCourseSelect = (course: CourseSelection) => {
    controller.handleCourseSelect(course);
  };

  const submitForm = async () => {
    await controller.submitForm(formData);
  };

  const resetForm = () => {
    controller['resetForm'](); // Acceder al método privado
  };

  const isFormValid = () => {
    return controller.isFormValid(formData);
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
    resetForm,
    isFormValid,
    
    // Controller instance (por si necesitas acceso directo)
    controller
  };
}

// controllers/ParticipantController.ts (actualizado)
import { Participant, FormMessage, FieldErrors } from '@/models/participant';
import { CourseSelection } from '@/models/course';
import { participantSchema } from '@/models/validation';
import { participantService } from '@/services/participantService';

export class ParticipantController {
  private setFormData: React.Dispatch<React.SetStateAction<Participant>>;
  private setMessage: React.Dispatch<React.SetStateAction<FormMessage | null>>;
  private setFieldErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
  private setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;

  constructor(
    setFormData: React.Dispatch<React.SetStateAction<Participant>>,
    setMessage: React.Dispatch<React.SetStateAction<FormMessage | null>>,
    setFieldErrors: React.Dispatch<React.SetStateAction<FieldErrors>>,
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    this.setFormData = setFormData;
    this.setMessage = setMessage;
    this.setFieldErrors = setFieldErrors;
    this.setIsSubmitting = setIsSubmitting;
  }

  validateField(name: string, value: string): void {
    try {
      // Evitar validar el campo de curso seleccionado aquí
      if (name === 'selectedCourse') return;
      
      participantSchema.shape[name as keyof typeof participantSchema.shape].parse(value);
      this.setFieldErrors((prev: FieldErrors) => ({ ...prev, [name]: '' }));
    } catch (error: any) {
      this.setFieldErrors((prev: FieldErrors) => ({ 
        ...prev, 
        [name]: error.errors[0]?.message || 'Campo inválido' 
      }));
    }
  }

  handleFieldChange(name: string, value: string): void {
    this.setFormData((prev: Participant) => ({ ...prev, [name]: value }));
    this.setFieldErrors((prev: FieldErrors) => ({ ...prev, [name]: '' }));
  }

  // NUEVA FUNCIÓN: Manejar selección de curso
  handleCourseSelect(course: CourseSelection): void {
    this.setFormData((prev: Participant) => ({ 
      ...prev, 
      selectedCourse: course 
    }));
    this.setFieldErrors((prev: FieldErrors) => ({ 
      ...prev, 
      selectedCourse: '' 
    }));
    // Limpiar mensaje cuando se selecciona un curso
    this.setMessage(null);
  }

  async submitForm(formData: Participant): Promise<void> {
    this.setIsSubmitting(true);
    this.setMessage(null);

    try {
      // Validar todos los campos incluyendo el curso seleccionado
      participantSchema.parse(formData);
      
      // Enviar datos
      const response = await participantService.register(formData);
      
      this.setMessage({
        text: response.message || 'Registro exitoso',
        type: 'success'
      });

      // Limpiar formulario
      this.resetForm();
      
    } catch (error: any) {
      if (error.errors) {
        // Errores de validación
        const firstError = error.errors[0];
        this.setMessage({
          text: firstError?.message || 'Datos inválidos',
          type: 'error'
        });
        
        // Marcar errores específicos
        if (firstError?.path?.includes('selectedCourse')) {
          this.setFieldErrors((prev: FieldErrors) => ({ 
            ...prev, 
            selectedCourse: 'Debe seleccionar un curso' 
          }));
        }
      } else {
        // Errores de API
        this.setMessage({
          text: error.response?.data?.message || 'Error al registrar',
          type: 'error'
        });
      }
    } finally {
      this.setIsSubmitting(false);
    }
  }

  private resetForm(): void {
    this.setFormData({
      selectedCourse: undefined, // NUEVO: Resetear curso seleccionado
      ciOrPassport: '',
      fullName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      country: '',
      cityOrProvince: '',
      profession: '',
      institution: ''
    });
    
    // Limpiar también los errores
    this.setFieldErrors({});
  }

  // NUEVA FUNCIÓN: Validar si el formulario está completo
  isFormValid(formData: Participant): boolean {
    try {
      participantSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  }

  // NUEVA FUNCIÓN: Obtener errores de validación sin enviar
  getValidationErrors(formData: Participant): FieldErrors {
    try {
      participantSchema.parse(formData);
      return {};
    } catch (error: any) {
      const errors: FieldErrors = {};
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const fieldName = err.path?.[0];
          if (fieldName) {
            errors[fieldName] = err.message;
          }
        });
      }
      
      return errors;
    }
  }
}

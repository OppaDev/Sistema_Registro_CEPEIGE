// controllers/ParticipantController.ts
import { Participant, FormMessage, FieldErrors } from '@/models/participant';
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

  async submitForm(formData: Participant): Promise<void> {
    this.setIsSubmitting(true);
    this.setMessage(null);

    try {
      // Validar todos los campos
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
        this.setMessage({
          text: error.errors[0]?.message || 'Datos inválidos',
          type: 'error'
        });
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
  }
}

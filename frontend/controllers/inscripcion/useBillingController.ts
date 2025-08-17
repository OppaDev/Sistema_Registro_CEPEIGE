// controllers/useBillingController.ts
import { useState, useCallback } from 'react';
import { BillingData, billingSchema, BillingFormMessage, BillingFieldErrors } from '@/models/inscripcion/billing';
import { billingService } from '@/services/inscripcion/billingService';

const initialBillingData: BillingData = {
  razonSocial: '',
  identificacionTributaria: '',
  telefono: '',
  correoFactura: '',
  direccion: ''
};

export const useBillingController = () => {
  const [formData, setFormData] = useState<BillingData>(initialBillingData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<BillingFormMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<BillingFieldErrors>({});

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [fieldErrors]);

  const validateField = useCallback((name: string, value: string) => {
    try {
      // Validar campo individual usando la validación completa del schema
      billingSchema.parse({ ...formData, [name]: value });
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    } catch (error: unknown) {
      const zodError = error as { errors?: Array<{ message?: string; path?: Array<string> }> };
      if (zodError.errors) {
        const fieldError = zodError.errors.find(err => err.path?.[0] === name);
        if (fieldError?.message) {
          setFieldErrors(prev => ({ ...prev, [name]: fieldError.message || '' }));
        }
      }
    }
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    try {
      billingSchema.parse(formData);
      setFieldErrors({});
      return true;
    } catch (error: unknown) {
      const zodError = error as { errors?: Array<{ path?: Array<string>; message?: string }> };
      const errors: BillingFieldErrors = {};
      zodError.errors?.forEach((err) => {
        if (err.path?.[0] && err.message) {
          errors[err.path[0]] = err.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
  }, [formData]);

  const submitForm = useCallback(async (): Promise<unknown> => {
    if (!validateForm()) {
      setMessage({
        text: 'Por favor, corrige los errores en el formulario',
        type: 'error'
      });
      throw new Error('Errores de validación');
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await billingService.create(formData);
      
      if (response.success) {
        setMessage({
          text: 'Datos de facturación registrados exitosamente',
          type: 'success'
        });
        
        // Retornar los datos creados para uso posterior
        return response.data;
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('Error submitting billing form:', error);
      setMessage({
        text: errorObj.message || 'Error al registrar los datos de facturación',
        type: 'error'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm]);

  const resetForm = useCallback(() => {
    setFormData(initialBillingData);
    setFieldErrors({});
    setMessage(null);
  }, []);

  return {
    formData,
    isLoading,
    message,
    fieldErrors,
    handleFieldChange,
    validateField,
    submitForm,
    resetForm,
    validateForm
  };
};

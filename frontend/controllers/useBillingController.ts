// controllers/useBillingController.ts
import { useState, useCallback } from 'react';
import { BillingData, billingSchema, BillingFormMessage, BillingFieldErrors } from '@/models/billing';
import { billingService } from '@/services/billingService';

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
      // Validar campo individual
      billingSchema.pick({ [name]: true } as any).parse({ [name]: value });
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    } catch (error: any) {
      if (error.errors?.[0]?.message) {
        setFieldErrors(prev => ({ ...prev, [name]: error.errors[0].message }));
      }
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    try {
      billingSchema.parse(formData);
      setFieldErrors({});
      return true;
    } catch (error: any) {
      const errors: BillingFieldErrors = {};
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          errors[err.path[0]] = err.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
  }, [formData]);

  const submitForm = useCallback(async (): Promise<any> => {
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
    } catch (error: any) {
      console.error('Error submitting billing form:', error);
      setMessage({
        text: error.message || 'Error al registrar los datos de facturación',
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

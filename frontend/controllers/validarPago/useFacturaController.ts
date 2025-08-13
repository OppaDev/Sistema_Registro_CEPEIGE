// controllers/validarPago/useFacturaController.ts
import { useState, useCallback } from 'react';
import { facturaService } from '@/services/validarPago/facturaService';
import { CreateFacturaData, FacturaData } from '@/models/validarPago/factura';

interface UseFacturaControllerReturn {
  // States
  factura: FacturaData | null;
  facturas: FacturaData[];
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isValidatingPayment: boolean;

  // Actions
  createFactura: (data: CreateFacturaData) => Promise<FacturaData | null>;
  getFacturaByInscripcion: (inscripcionId: number) => Promise<FacturaData | null>;
  verificarPago: (facturaId: number) => Promise<boolean>;
  clearError: () => void;
  resetFactura: () => void;
}

export const useFacturaController = (): UseFacturaControllerReturn => {
  const [factura, setFactura] = useState<FacturaData | null>(null);
  const [facturas, setFacturas] = useState<FacturaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isValidatingPayment, setIsValidatingPayment] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetFactura = useCallback(() => {
    setFactura(null);
    setError(null);
  }, []);

  const createFactura = useCallback(async (data: CreateFacturaData): Promise<FacturaData | null> => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newFactura = await facturaService.createFactura(data);
      setFactura(newFactura);
      console.log('✅ Factura creada exitosamente:', newFactura);
      return newFactura;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear la factura';
      setError(errorMessage);
      console.error('❌ Error creating factura:', error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const getFacturaByInscripcion = useCallback(async (inscripcionId: number): Promise<FacturaData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const facturas = await facturaService.getFacturasByInscripcionId(inscripcionId);
      if (facturas && facturas.length > 0) {
        const facturaEncontrada = facturas[0]; // Tomar la primera factura
        setFactura(facturaEncontrada);
        console.log('✅ Factura encontrada:', facturaEncontrada);
        return facturaEncontrada;
      } else {
        setFactura(null);
        console.log('ℹ️ No se encontró factura para la inscripción:', inscripcionId);
        return null;
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al obtener la factura';
      setError(errorMessage);
      console.error('❌ Error fetching factura:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verificarPago = useCallback(async (facturaId: number): Promise<boolean> => {
    setIsValidatingPayment(true);
    setError(null);
    
    try {
      const facturaActualizada = await facturaService.verificarPago(facturaId);
      setFactura(facturaActualizada);
      console.log('✅ Pago verificado exitosamente:', facturaActualizada);
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al verificar el pago';
      setError(errorMessage);
      console.error('❌ Error verifying payment:', error);
      return false;
    } finally {
      setIsValidatingPayment(false);
    }
  }, []);

  return {
    // States
    factura,
    facturas,
    loading,
    error,
    isCreating,
    isValidatingPayment,

    // Actions
    createFactura,
    getFacturaByInscripcion,
    verificarPago,
    clearError,
    resetFactura
  };
};
// controllers/validarPago/useDescuentoController.ts
import { useState, useCallback } from 'react';
import { descuentoService } from '@/services/validarPago/descuentoService';
import { CreateDescuentoData, DescuentoData, DescuentoFormData } from '@/models/validarPago/descuento';

interface UseDescuentoControllerReturn {
  // States
  descuento: DescuentoData | null;
  descuentos: DescuentoData[];
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;

  // Actions
  createDescuento: (data: DescuentoFormData) => Promise<DescuentoData | null>;
  getDescuentoById: (id: number) => Promise<DescuentoData | null>;
  getAllDescuentos: () => Promise<DescuentoData[]>;
  clearError: () => void;
  resetDescuento: () => void;
}

export const useDescuentoController = (): UseDescuentoControllerReturn => {
  const [descuento, setDescuento] = useState<DescuentoData | null>(null);
  const [descuentos, setDescuentos] = useState<DescuentoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetDescuento = useCallback(() => {
    setDescuento(null);
    setError(null);
  }, []);

  const createDescuento = useCallback(async (formData: DescuentoFormData): Promise<DescuentoData | null> => {
    setIsCreating(true);
    setError(null);
    
    try {
      // Convertir formData a CreateDescuentoData
      const data: CreateDescuentoData = {
        tipoDescuento: formData.tipoDescuento,
        valorDescuento: formData.cantidadDescuento || 0,
        porcentajeDescuento: 0, // Se puede calcular basado en el valor
        descripcionDescuento: formData.descripcion || `Descuento ${formData.tipoDescuento}${formData.numeroEstudiantes ? ` para ${formData.numeroEstudiantes} estudiantes` : ''}`
      };

      const newDescuento = await descuentoService.createDescuento(data);
      setDescuento(newDescuento);
      console.log('✅ Descuento creado exitosamente:', newDescuento);
      return newDescuento;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear el descuento';
      setError(errorMessage);
      console.error('❌ Error creating descuento:', error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const getDescuentoById = useCallback(async (id: number): Promise<DescuentoData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const descuentoEncontrado = await descuentoService.getDescuentoById(id);
      setDescuento(descuentoEncontrado);
      console.log('✅ Descuento encontrado:', descuentoEncontrado);
      return descuentoEncontrado;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al obtener el descuento';
      setError(errorMessage);
      console.error('❌ Error fetching descuento:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllDescuentos = useCallback(async (): Promise<DescuentoData[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { descuentos } = await descuentoService.getAllDescuentos();
      setDescuentos(descuentos);
      console.log('✅ Descuentos obtenidos:', descuentos);
      return descuentos;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al obtener los descuentos';
      setError(errorMessage);
      console.error('❌ Error fetching descuentos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // States
    descuento,
    descuentos,
    loading,
    error,
    isCreating,
    isUpdating,

    // Actions
    createDescuento,
    getDescuentoById,
    getAllDescuentos,
    clearError,
    resetDescuento
  };
};
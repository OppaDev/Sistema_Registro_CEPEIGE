// controllers/validarPago/useFacturaController.ts
import { useState, useCallback } from 'react';
import { facturaService } from '@/services/validarPago/facturaService';
import { 
  Factura, 
  CreateFacturaRequest, 
  UpdateFacturaRequest,
  FacturaResponse 
} from '@/models/validarPago/factura';

interface UseFacturaControllerState {
  factura: Factura | null;
  facturas: Factura[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

interface UseFacturaControllerReturn {
  // Estado
  state: UseFacturaControllerState;
  
  // Acciones
  createFactura: (data: CreateFacturaRequest) => Promise<boolean>;
  getFacturaById: (id: number) => Promise<boolean>;
  getFacturasByInscripcionId: (inscripcionId: number) => Promise<boolean>;
  updateFactura: (id: number, data: UpdateFacturaRequest) => Promise<boolean>;
  verificarPago: (id: number) => Promise<boolean>;
  searchByNumeroFactura: (numeroFactura: string) => Promise<boolean>;
  searchByNumeroIngreso: (numeroIngreso: string) => Promise<boolean>;
  
  // Utilidades
  clearError: () => void;
  clearSuccess: () => void;
  clearFactura: () => void;
  generateTemporaryNumbers: (inscripcionId: number) => { numeroIngreso: string; numeroFactura: string };
  validateTemporaryNumber: (numero: string) => boolean;
}

export const useFacturaController = (): UseFacturaControllerReturn => {
  const [state, setState] = useState<UseFacturaControllerState>({
    factura: null,
    facturas: [],
    loading: false,
    error: null,
    success: null
  });

  // Helper para actualizar estado
  const updateState = useCallback((updates: Partial<UseFacturaControllerState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  // Helper para manejar errores
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const errorMessage = error.message || defaultMessage;
    console.error('❌ FacturaController Error:', errorMessage);
    updateState({
      loading: false,
      error: errorMessage,
      success: null
    });
    return false;
  }, [updateState]);

  // Helper para manejar éxito
  const handleSuccess = useCallback((message: string, data?: any) => {
    console.log('✅ FacturaController Success:', message, data);
    updateState({
      loading: false,
      error: null,
      success: message,
      ...data
    });
    return true;
  }, [updateState]);

  // Crear factura
  const createFactura = useCallback(async (data: CreateFacturaRequest): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await facturaService.createFactura(data);
      
      if (response.success) {
        return handleSuccess('Factura creada exitosamente', { 
          factura: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al crear factura');
      }
    } catch (error: any) {
      return handleError(error, 'Error al crear factura');
    }
  }, [updateState, handleError, handleSuccess]);

  // Obtener factura por ID
  const getFacturaById = useCallback(async (id: number): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await facturaService.getFacturaById(id);
      
      if (response.success) {
        return handleSuccess('Factura obtenida exitosamente', { 
          factura: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al obtener factura');
      }
    } catch (error: any) {
      return handleError(error, 'Error al obtener factura');
    }
  }, [updateState, handleError, handleSuccess]);

  // Obtener facturas por inscripción
  const getFacturasByInscripcionId = useCallback(async (inscripcionId: number): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      console.log('🔍 Buscando facturas para inscripción:', inscripcionId);
      const response = await facturaService.getFacturasByInscripcionId(inscripcionId);
      
      console.log('📦 Respuesta del servicio:', {
        success: response.success,
        message: response.message,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: response.data?.length
      });
      
      if (response.success) {
        // Asegurarse de que data sea un array
        const facturas = Array.isArray(response.data) ? response.data : [];
        const firstFactura = facturas.length > 0 ? facturas[0] : null;
        
        console.log('✅ Facturas procesadas:', {
          facturasCount: facturas.length,
          firstFactura: firstFactura ? {
            id: firstFactura.idFactura,
            inscripcionId: firstFactura.idInscripcion,
            verificacionPago: firstFactura.verificacionPago
          } : null
        });
        
        return handleSuccess('Facturas obtenidas exitosamente', { 
          facturas: facturas,
          factura: firstFactura
        });
      } else {
        console.log('❌ Error en respuesta del servicio:', response.message);
        return handleError(new Error(response.message), 'Error al obtener facturas');
      }
    } catch (error: any) {
      console.error('❌ Error en getFacturasByInscripcionId:', error);
      return handleError(error, 'Error al obtener facturas');
    }
  }, [updateState, handleError, handleSuccess]);

  // Actualizar factura
  const updateFactura = useCallback(async (id: number, data: UpdateFacturaRequest): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await facturaService.updateFactura(id, data);
      
      if (response.success) {
        return handleSuccess('Factura actualizada exitosamente', { 
          factura: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al actualizar factura');
      }
    } catch (error: any) {
      return handleError(error, 'Error al actualizar factura');
    }
  }, [updateState, handleError, handleSuccess]);

  // Verificar pago
  const verificarPago = useCallback(async (id: number): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await facturaService.verificarPago(id);
      
      if (response.success) {
        return handleSuccess('Pago verificado exitosamente', { 
          factura: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al verificar pago');
      }
    } catch (error: any) {
      return handleError(error, 'Error al verificar pago');
    }
  }, [updateState, handleError, handleSuccess]);

  // Buscar por número de factura
  const searchByNumeroFactura = useCallback(async (numeroFactura: string): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await facturaService.getFacturaByNumeroFactura(numeroFactura);
      
      if (response.success) {
        return handleSuccess('Factura encontrada', { 
          factura: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al buscar factura');
      }
    } catch (error: any) {
      return handleError(error, 'Error al buscar factura por número');
    }
  }, [updateState, handleError, handleSuccess]);

  // Buscar por número de ingreso
  const searchByNumeroIngreso = useCallback(async (numeroIngreso: string): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await facturaService.getFacturaByNumeroIngreso(numeroIngreso);
      
      if (response.success) {
        return handleSuccess('Factura encontrada', { 
          factura: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al buscar factura');
      }
    } catch (error: any) {
      return handleError(error, 'Error al buscar factura por número de ingreso');
    }
  }, [updateState, handleError, handleSuccess]);

  // Limpiar error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Limpiar éxito
  const clearSuccess = useCallback(() => {
    updateState({ success: null });
  }, [updateState]);

  // Limpiar factura
  const clearFactura = useCallback(() => {
    updateState({ factura: null, facturas: [] });
  }, [updateState]);

  // Generar números temporales
  const generateTemporaryNumbers = useCallback((inscripcionId: number) => {
    return facturaService.generateTemporaryNumbers(inscripcionId);
  }, []);

  // Validar número temporal
  const validateTemporaryNumber = useCallback((numero: string): boolean => {
    return facturaService.isTemporaryNumber(numero);
  }, []);

  return {
    state,
    createFactura,
    getFacturaById,
    getFacturasByInscripcionId,
    updateFactura,
    verificarPago,
    searchByNumeroFactura,
    searchByNumeroIngreso,
    clearError,
    clearSuccess,
    clearFactura,
    generateTemporaryNumbers,
    validateTemporaryNumber
  };
};
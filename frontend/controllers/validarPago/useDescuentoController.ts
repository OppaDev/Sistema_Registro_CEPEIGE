// controllers/validarPago/useDescuentoController.ts
import { useState, useCallback } from 'react';
import { descuentoService } from '@/services/validarPago/descuentoService';
import { 
  Descuento, 
  CreateDescuentoRequest, 
  UpdateDescuentoRequest,
  TipoDescuento,
  DescuentoInscripcion
} from '@/models/validarPago/descuento';

interface UseDescuentoControllerState {
  descuento: Descuento | null;
  descuentos: Descuento[];
  loading: boolean;
  error: string | null;
  success: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseDescuentoControllerReturn {
  // Estado
  state: UseDescuentoControllerState;
  
  // Acciones CRUD
  createDescuento: (data: CreateDescuentoRequest) => Promise<boolean>;
  getDescuentoById: (id: number) => Promise<boolean>;
  getAllDescuentos: (options?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }) => Promise<boolean>;
  updateDescuento: (id: number, data: UpdateDescuentoRequest) => Promise<boolean>;
  deleteDescuento: (id: number) => Promise<boolean>;
  
  // Acciones específicas
  createDescuentoGrupal: (inscripcionInfo: DescuentoInscripcion) => Promise<boolean>;
  aplicarDescuentoAInscripcion: (inscripcionId: number, descuentoId: number) => Promise<boolean>;
  
  // Utilidades
  clearError: () => void;
  clearSuccess: () => void;
  clearDescuento: () => void;
  calcularDescuentoParaMonto: (monto: number, descuento: Descuento) => {
    montoDescuento: number;
    montoFinal: number;
    porcentajeAplicado: number;
  };
  isDescuentoAplicable: (descuento: Descuento, montoBase: number) => boolean;
  getTiposDescuento: () => { value: TipoDescuento; label: string }[];
}

export const useDescuentoController = (): UseDescuentoControllerReturn => {
  const [state, setState] = useState<UseDescuentoControllerState>({
    descuento: null,
    descuentos: [],
    loading: false,
    error: null,
    success: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  });

  // Helper para actualizar estado
  const updateState = useCallback((updates: Partial<UseDescuentoControllerState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  // Helper para manejar errores
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const errorMessage = error.message || defaultMessage;
    console.error('❌ DescuentoController Error:', errorMessage);
    updateState({
      loading: false,
      error: errorMessage,
      success: null
    });
    return false;
  }, [updateState]);

  // Helper para manejar éxito
  const handleSuccess = useCallback((message: string, data?: any) => {
    console.log('✅ DescuentoController Success:', message);
    updateState({
      loading: false,
      error: null,
      success: message,
      ...data
    });
    return true;
  }, [updateState]);

  // Crear descuento
  const createDescuento = useCallback(async (data: CreateDescuentoRequest): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await descuentoService.createDescuento(data);
      
      if (response.success) {
        return handleSuccess('Descuento creado exitosamente', { 
          descuento: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al crear descuento');
      }
    } catch (error: any) {
      return handleError(error, 'Error al crear descuento');
    }
  }, [updateState, handleError, handleSuccess]);

  // Obtener descuento por ID
  const getDescuentoById = useCallback(async (id: number): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await descuentoService.getDescuentoById(id);
      
      if (response.success) {
        return handleSuccess('Descuento obtenido exitosamente', { 
          descuento: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al obtener descuento');
      }
    } catch (error: any) {
      return handleError(error, 'Error al obtener descuento');
    }
  }, [updateState, handleError, handleSuccess]);

  // Obtener todos los descuentos
  const getAllDescuentos = useCallback(async (options: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await descuentoService.getAllDescuentos(options);
      
      if (response.success) {
        const pagination = {
          total: response.data.length,
          page: options.page || 1,
          limit: options.limit || 10,
          totalPages: Math.ceil(response.data.length / (options.limit || 10))
        };

        return handleSuccess('Descuentos obtenidos exitosamente', { 
          descuentos: response.data,
          pagination
        });
      } else {
        return handleError(new Error(response.message), 'Error al obtener descuentos');
      }
    } catch (error: any) {
      return handleError(error, 'Error al obtener descuentos');
    }
  }, [updateState, handleError, handleSuccess]);

  // Actualizar descuento
  const updateDescuento = useCallback(async (id: number, data: UpdateDescuentoRequest): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await descuentoService.updateDescuento(id, data);
      
      if (response.success) {
        return handleSuccess('Descuento actualizado exitosamente', { 
          descuento: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al actualizar descuento');
      }
    } catch (error: any) {
      return handleError(error, 'Error al actualizar descuento');
    }
  }, [updateState, handleError, handleSuccess]);

  // Eliminar descuento
  const deleteDescuento = useCallback(async (id: number): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await descuentoService.deleteDescuento(id);
      
      if (response.success) {
        // Actualizar lista eliminando el descuento
        setState(prevState => ({
          ...prevState,
          loading: false,
          error: null,
          success: 'Descuento eliminado exitosamente',
          descuentos: prevState.descuentos.filter(d => d.idDescuento !== id),
          descuento: prevState.descuento?.idDescuento === id ? null : prevState.descuento
        }));
        return true;
      } else {
        return handleError(new Error(response.message), 'Error al eliminar descuento');
      }
    } catch (error: any) {
      return handleError(error, 'Error al eliminar descuento');
    }
  }, [handleError]);

  // Crear descuento grupal
  const createDescuentoGrupal = useCallback(async (inscripcionInfo: DescuentoInscripcion): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await descuentoService.createDescuentoGrupal(inscripcionInfo);
      
      if (response.success) {
        return handleSuccess('Descuento grupal creado exitosamente', { 
          descuento: response.data 
        });
      } else {
        return handleError(new Error(response.message), 'Error al crear descuento grupal');
      }
    } catch (error: any) {
      return handleError(error, 'Error al crear descuento grupal');
    }
  }, [updateState, handleError, handleSuccess]);

  // Aplicar descuento a inscripción
  const aplicarDescuentoAInscripcion = useCallback(async (inscripcionId: number, descuentoId: number): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null, success: null });

      const response = await descuentoService.aplicarDescuentoAInscripcion(inscripcionId, descuentoId);
      
      if (response.success) {
        return handleSuccess('Descuento aplicado exitosamente');
      } else {
        return handleError(new Error(response.message), 'Error al aplicar descuento');
      }
    } catch (error: any) {
      return handleError(error, 'Error al aplicar descuento');
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

  // Limpiar descuento
  const clearDescuento = useCallback(() => {
    updateState({ descuento: null, descuentos: [] });
  }, [updateState]);

  // Calcular descuento para monto
  const calcularDescuentoParaMonto = useCallback((monto: number, descuento: Descuento) => {
    return descuentoService.calcularDescuentoParaMonto(monto, descuento);
  }, []);

  // Validar si descuento es aplicable
  const isDescuentoAplicable = useCallback((descuento: Descuento, montoBase: number): boolean => {
    return descuentoService.isDescuentoAplicable(descuento, montoBase);
  }, []);

  // Obtener tipos de descuento
  const getTiposDescuento = useCallback(() => {
    return descuentoService.getTiposDescuento();
  }, []);

  return {
    state,
    createDescuento,
    getDescuentoById,
    getAllDescuentos,
    updateDescuento,
    deleteDescuento,
    createDescuentoGrupal,
    aplicarDescuentoAInscripcion,
    clearError,
    clearSuccess,
    clearDescuento,
    calcularDescuentoParaMonto,
    isDescuentoAplicable,
    getTiposDescuento
  };
};
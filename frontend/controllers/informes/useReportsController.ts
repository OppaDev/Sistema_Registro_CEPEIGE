import { useState, useCallback } from 'react';
import { 
  TipoInforme, 
  FormatoExportacion, 
  GenerarInformeData,
  FiltrosInforme,
  InformeCompleto,
  EstadisticasInforme,
  CursoDisponible,
  ConfiguracionInformes
} from '@/models/informe/informe';
import informeService from '@/services/informeService';

interface UseReportsControllerReturn {
  // Estados
  loading: boolean;
  error: string | null;
  success: string | null;
  
  // Datos
  cursosDisponibles: CursoDisponible[];
  configuracion: ConfiguracionInformes | null;
  datosInforme: InformeCompleto | null;
  estadisticas: EstadisticasInforme | null;
  
  // Métodos
  loadInitialData: () => Promise<void>;
  loadCursosDisponibles: () => Promise<void>;
  loadConfiguracion: () => Promise<void>;
  obtenerDatosInforme: (filtros: FiltrosInforme) => Promise<void>;
  obtenerEstadisticas: (filtros: FiltrosInforme) => Promise<void>;
  generarInforme: (data: GenerarInformeData) => Promise<void>;
  generarInformeRapido: (tipo: TipoInforme, formato: FormatoExportacion, filtros?: FiltrosInforme) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
  clearMessages: () => void;
}

export const useReportsController = (): UseReportsControllerReturn => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Datos
  const [cursosDisponibles, setCursosDisponibles] = useState<CursoDisponible[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionInformes | null>(null);
  const [datosInforme, setDatosInforme] = useState<InformeCompleto | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasInforme | null>(null);

  // Métodos de utilidad
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleError = useCallback((err: unknown, defaultMessage: string) => {
    const errorMessage = err instanceof Error ? err.message : defaultMessage;
    setError(errorMessage);
    console.error(defaultMessage, err);
  }, []);

  // Cargar cursos disponibles
  const loadCursosDisponibles = useCallback(async () => {
    try {
      const cursos = await informeService.obtenerCursosDisponibles();
      setCursosDisponibles(cursos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar cursos disponibles';
      setError(errorMessage);
      console.error('Error al cargar cursos disponibles', err);
      throw err;
    }
  }, []);

  // Cargar configuración de informes
  const loadConfiguracion = useCallback(async () => {
    try {
      const config = await informeService.obtenerConfiguracionInformes();
      setConfiguracion(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar configuración de informes';
      setError(errorMessage);
      console.error('Error al cargar configuración de informes', err);
      throw err;
    }
  }, []);

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await Promise.all([
        loadCursosDisponibles(),
        loadConfiguracion()
      ]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos iniciales';
      setError(errorMessage);
      console.error('Error al cargar datos iniciales', err);
    } finally {
      setLoading(false);
    }
  }, [loadCursosDisponibles, loadConfiguracion]);

  // Obtener datos completos del informe
  const obtenerDatosInforme = useCallback(async (filtros: FiltrosInforme) => {
    try {
      setLoading(true);
      clearMessages();
      
      const datos = await informeService.obtenerDatosInforme(filtros);
      setDatosInforme(datos);
      setEstadisticas(datos.estadisticas);
      
    } catch (err) {
      handleError(err, 'Error al obtener datos del informe');
    } finally {
      setLoading(false);
    }
  }, [handleError, clearMessages]);

  // Obtener solo estadísticas
  const obtenerEstadisticas = useCallback(async (filtros: FiltrosInforme) => {
    try {
      setLoading(true);
      clearMessages();
      
      const response = await informeService.obtenerEstadisticas(filtros);
      setEstadisticas(response.estadisticas);
      
    } catch (err) {
      handleError(err, 'Error al obtener estadísticas');
    } finally {
      setLoading(false);
    }
  }, [handleError, clearMessages]);

  // Generar informe personalizado
  const generarInforme = useCallback(async (data: GenerarInformeData) => {
    try {
      setLoading(true);
      clearMessages();
      
      // Validaciones
      if (!data.tipoInforme || !data.formato) {
        throw new Error('Tipo de informe y formato son requeridos');
      }

      if (data.fechaInicio && data.fechaFin) {
        const fechaInicio = new Date(data.fechaInicio);
        const fechaFin = new Date(data.fechaFin);
        
        if (fechaInicio > fechaFin) {
          throw new Error('La fecha de inicio no puede ser mayor que la fecha de fin');
        }
      }

      await informeService.generarInforme(data);
      
      setSuccess(`Informe ${data.formato.toUpperCase()} generado y descargado exitosamente`);
      
    } catch (err) {
      handleError(err, 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  }, [handleError, clearMessages]);

  // Generar informe rápido
  const generarInformeRapido = useCallback(async (
    tipo: TipoInforme, 
    formato: FormatoExportacion, 
    filtros: FiltrosInforme = {}
  ) => {
    const data: GenerarInformeData = {
      tipoInforme: tipo,
      formato: formato,
      ...filtros
    };
    
    await generarInforme(data);
  }, [generarInforme]);

  return {
    // Estados
    loading,
    error,
    success,
    
    // Datos
    cursosDisponibles,
    configuracion,
    datosInforme,
    estadisticas,
    
    // Métodos
    loadInitialData,
    loadCursosDisponibles,
    loadConfiguracion,
    obtenerDatosInforme,
    obtenerEstadisticas,
    generarInforme,
    generarInformeRapido,
    clearError,
    clearSuccess,
    clearMessages
  };
};
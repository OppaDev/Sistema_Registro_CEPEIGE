// controllers/useInscriptionController.ts
import { useState, useEffect, useCallback } from 'react';
import { InscriptionData } from '@/models/inscription';
import { inscriptionService, InscriptionApiData } from '@/services/inscriptionService';

interface UseInscriptionControllerReturn {
  // Estado
  inscriptions: InscriptionData[];
  selectedInscription: InscriptionData | null;
  loading: boolean;
  message: { type: 'success' | 'error' | 'info'; text: string } | null;
  
  // Paginación
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Acciones
  refreshInscriptions: () => Promise<void>;
  handlePageChange: (page: number) => void;
  viewInscriptionDetails: (inscription: InscriptionData) => void;
  closeInscriptionDetails: () => void;
  setMessage: (message: { type: 'success' | 'error' | 'info'; text: string } | null) => void;
}

export const useInscriptionController = (): UseInscriptionControllerReturn => {
  // Estados
  const [inscriptions, setInscriptions] = useState<InscriptionData[]>([]);
  const [selectedInscription, setSelectedInscription] = useState<InscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Cargar inscripciones
  const loadInscriptions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setMessage(null);

      console.log('🔄 Cargando inscripciones - Página:', page);

      const response = await inscriptionService.getAllInscriptions({
        page,
        limit: itemsPerPage,
        orderBy: 'fechaInscripcion',
        order: 'desc'
      });

      if (response.success) {
        // Mapear datos de API a modelo del frontend
        const mappedInscriptions = response.data.map(apiData => 
          inscriptionService.mapApiDataToInscriptionData(apiData)
        );

        setInscriptions(mappedInscriptions);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);

        console.log('✅ Inscripciones cargadas:', {
          total: response.pagination.total,
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          inscriptions: mappedInscriptions.length
        });

        if (mappedInscriptions.length === 0 && page === 1) {
          setMessage({
            type: 'info',
            text: 'No hay inscripciones registradas aún.'
          });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('❌ Error cargando inscripciones:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al cargar las inscripciones'
      });
      setInscriptions([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Refrescar inscripciones
  const refreshInscriptions = useCallback(async () => {
    await loadInscriptions(currentPage);
  }, [loadInscriptions, currentPage]);

  // Cambiar página
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      loadInscriptions(page);
    }
  }, [loadInscriptions, totalPages, currentPage]);

  // Ver detalles de inscripción
  const viewInscriptionDetails = useCallback(async (inscription: InscriptionData) => {
    try {
      console.log('👁️ Viendo detalles de inscripción:', inscription.idInscripcion);
      
      // Obtener datos actualizados de la API
      const response = await inscriptionService.getInscriptionById(inscription.idInscripcion);
      
      if (response.success) {
        const updatedInscription = inscriptionService.mapApiDataToInscriptionData(response.data);
        setSelectedInscription(updatedInscription);
      } else {
        // Si falla, usar los datos que ya tenemos
        setSelectedInscription(inscription);
        setMessage({
          type: 'info',
          text: 'Mostrando datos en caché. Los datos más recientes no están disponibles.'
        });
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo detalles:', error);
      // Usar datos que ya tenemos como fallback
      setSelectedInscription(inscription);
      setMessage({
        type: 'info',
        text: 'Mostrando datos en caché.'
      });
    }
  }, []);

  // Cerrar detalles
  const closeInscriptionDetails = useCallback(() => {
    setSelectedInscription(null);
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInscriptions(1);
  }, [loadInscriptions]);

  // Auto-ocultar mensajes después de 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return {
    // Estado
    inscriptions,
    selectedInscription,
    loading,
    message,
    
    // Paginación
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    
    // Acciones
    refreshInscriptions,
    handlePageChange,
    viewInscriptionDetails,
    closeInscriptionDetails,
    setMessage
  };
};

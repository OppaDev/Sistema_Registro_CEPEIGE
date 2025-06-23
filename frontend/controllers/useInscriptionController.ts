// controllers/useInscriptionController.ts
import { useState, useEffect } from 'react';
import { InscriptionData, InscriptionFilters } from '@/models/inscription';
import { inscriptionService } from '@/services/inscriptionService';

export interface InscriptionMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

export function useInscriptionController() {
  const [inscriptions, setInscriptions] = useState<InscriptionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<InscriptionMessage | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);
  const [filters, setFilters] = useState<InscriptionFilters>({});
  const [selectedInscription, setSelectedInscription] = useState<InscriptionData | null>(null);

  const loadInscriptions = async (page: number = currentPage, newFilters?: InscriptionFilters): Promise<void> => {
    setLoading(true);
    setMessage(null);

    try {
      const filtersToUse = newFilters || filters;
      const response = await inscriptionService.getAllInscriptions(page, itemsPerPage, filtersToUse);
      
      if (response.success && response.data) {
        setInscriptions(response.data);
        setTotalItems(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
        setCurrentPage(page);
        
        if (response.data.length === 0) {
          setMessage({
            text: 'No se encontraron inscripciones con los filtros aplicados',
            type: 'info'
          });
        }
      } else {
        throw new Error(response.message || 'Error al cargar inscripciones');
      }
    } catch (error: any) {
      console.error('❌ Error loading inscriptions:', error);
      setMessage({
        text: error.message || 'Error al cargar las inscripciones',
        type: 'error'
      });
      setInscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: InscriptionFilters): void => {
    setFilters(newFilters);
    setCurrentPage(1);
    loadInscriptions(1, newFilters);
  };

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      loadInscriptions(page);
    }
  };

  const refreshInscriptions = (): void => {
    loadInscriptions(currentPage);
  };

  const viewInscriptionDetails = (inscription: InscriptionData): void => {
    setSelectedInscription(inscription);
  };

  const closeInscriptionDetails = (): void => {
    setSelectedInscription(null);
  };

  // Cargar inscripciones al montar el componente
  useEffect(() => {
    loadInscriptions(1);
  }, []);

  return {
    // Estado
    inscriptions,
    loading,
    message,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,
    selectedInscription,
    
    // Acciones
    loadInscriptions,
    handleFilterChange,
    handlePageChange,
    refreshInscriptions,
    viewInscriptionDetails,
    closeInscriptionDetails,
    setMessage
  };
}

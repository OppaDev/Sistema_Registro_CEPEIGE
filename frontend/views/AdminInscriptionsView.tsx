// views/AdminInscriptionsView.tsx
"use client";

import React from 'react';
import { useInscriptionController } from '@/controllers/useInscriptionController';
import { AdminLayout } from './components/AdminLayout';
import { InscriptionTable } from './components/InscriptionTable';
import { InscriptionDetailModal } from './components/InscriptionDetailModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Edit } from 'lucide-react';
import { EditInscriptionModal } from './components/EditInscriptionModal';
import { DeleteInscriptionModal } from './components/DeleteInscriptionModal';


export default function AdminInscriptionsView() {
  const {
    inscriptions,
    loading,
    message,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    refreshInscriptions,
    handlePageChange,
    viewInscriptionDetails,
    selectedInscription,
    closeInscriptionDetails,
    setMessage,
    selectedInscriptionForEdit,
    isEditModalOpen,
    isUpdating,
    openEditModal,
    closeEditModal,
    updateInscription,
    deleteInscription,
    isDeleting,
    selectedInscriptionForDelete,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
  } = useInscriptionController();

   const [refreshKey, setRefreshKey] = React.useState(0);

  const handleRefresh = () => {
    setMessage(null);
    setRefreshKey(prev => prev + 1); // 🆕 INCREMENTAR KEY
    refreshInscriptions();
  };

  // 🆕 EFECTO PARA ACTUALIZAR KEY CUANDO CAMBIAN LAS INSCRIPCIONES
  React.useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [inscriptions.length, totalItems]);


  return (
    <AdminLayout userType="admin" activeModule="inscripciones">
      <div className="space-y-6">
        {/* Encabezado simplificado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ 
                color: '#000000',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700
              }}
            >
              Inscripciones Registradas
            </h1>
            <p className="text-gray-600 mt-1">
              Consulta la información registrada por los participantes
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>

        {/* QUITAR: Estadísticas rápidas - Solo mostrar total */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total de Inscripciones</p>
              <p className="text-4xl font-bold mt-2" style={{ color: '#0367A6' }}>
                {totalItems}
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje global */}
        {message && (
          <Alert className={`${
            message.type === 'success' 
              ? 'border-green-500 bg-green-50' 
              : message.type === 'error'
              ? 'border-red-500 bg-red-50'
              : 'border-blue-500 bg-blue-50'
          }`}>
            <AlertDescription className={`font-medium ${
              message.type === 'success' 
                ? 'text-green-800' 
                : message.type === 'error'
                ? 'text-red-800'
                : 'text-blue-800'
            }`}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabla de inscripciones */}
          <InscriptionTable
          key={`inscriptions-${inscriptions.length}-${totalItems}-${currentPage}`}
          inscriptions={inscriptions}
          loading={loading}
          onViewDetails={viewInscriptionDetails}
          onEditInscription={openEditModal} // 🆕 NUEVA PROP
          onDeleteInscription={openDeleteModal}
          userType="admin" // 🆕 NUEVA PROP
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
        {/* Modal de detalles - SOLO PARA VISUALIZAR */}
        <InscriptionDetailModal
          inscription={selectedInscription}
          isOpen={!!selectedInscription}
          onClose={closeInscriptionDetails}
          userType="admin"
        />
        {/* 🆕 NUEVO MODAL DE EDICIÓN */}
        <EditInscriptionModal
          inscription={selectedInscriptionForEdit}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onUpdate={updateInscription}
          userType="admin"
          isUpdating={isUpdating}
        />
         {/* 🆕 MODAL DE ELIMINACIÓN */}
        <DeleteInscriptionModal
          isOpen={isDeleteModalOpen}
          inscription={selectedInscriptionForDelete}
          isDeleting={isDeleting}
          onConfirm={deleteInscription}
          onCancel={closeDeleteModal}
        />
      </div>
    </AdminLayout>
  );
}

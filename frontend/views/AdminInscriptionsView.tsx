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
import { EditInscriptionRequest } from '@/models/inscription';


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
    forceRefresh, // ✅ USAR LA NUEVA FUNCIÓN
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

  const [forceRenderKey, setForceRenderKey] = React.useState(0);

  const handleRefresh = async () => {
    setMessage(null);
    setForceRenderKey(prev => prev + 1);
    await forceRefresh();
    console.log('🔄 Tabla de admin refrescada manualmente');
  };

  // 🆕 EFECTO PARA ACTUALIZAR KEY CUANDO CAMBIAN LAS INSCRIPCIONES
  React.useEffect(() => {
    console.log('🔄 AdminView: Inscripciones cambiaron, actualizando renderKey');
    setForceRenderKey(prev => prev + 1);
  }, [inscriptions, totalItems, inscriptions.length]);

  // 🆕 EFECTO ADICIONAL PARA DETECTAR CAMBIOS PROFUNDOS EN INSCRIPCIONES
  React.useEffect(() => {
    const inscriptionIds = inscriptions.map(i => `${i.idInscripcion}-${i.updatedAt || ''}`).join(',');
    setForceRenderKey(prev => prev + 1);
  }, [inscriptions.map(i => `${i.idInscripcion}-${i.participante?.nombres}-${i.participante?.apellidos}-${i.facturacion?.ruc}-${i.facturacion?.razonSocial}`).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateInscription = React.useCallback(async (updateData: EditInscriptionRequest) => {
    console.log('📝 AdminInscriptionsView: Procesando actualización...');
    
    try {
      // Actualizar usando el controlador
      await updateInscription(updateData);
      
      // Forzar actualización adicional de la vista después de un breve delay
      setTimeout(() => {
        console.log('🔄 Forzando re-render adicional en AdminView');
        setForceRenderKey(prev => prev + 1);
      }, 300);
      
    } catch (error) {
      console.error('❌ Error en handleUpdateInscription (AdminView):', error);
    }
  }, [updateInscription]);


  return (
    <AdminLayout userType="admin" activeModule="inscripciones">
      <div className="space-y-6">
        {/* Encabezado simplificado */}
       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 
              className="text-2xl lg:text-3xl font-bold"
              style={{ 
                color: '#000000',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700
              }}
            >
              Inscripciones Registradas
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Consulta la información registrada por los participantes
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2 w-full lg:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>

        {/* QUITAR: Estadísticas rápidas - Solo mostrar total */}
        <div className="bg-white rounded-lg border p-4 lg:p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total de Inscripciones</p>
               <p className="text-3xl lg:text-4xl font-bold mt-2" style={{ color: '#0367A6' }}>
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
          key={`admin-inscriptions-${forceRenderKey}-${inscriptions.length}-${totalItems}-${currentPage}`}
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
          key={`edit-modal-${selectedInscriptionForEdit?.idInscripcion || 'new'}-${forceRenderKey}`}
          inscription={selectedInscriptionForEdit}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onUpdate={handleUpdateInscription}
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

// views/AccountantInscriptionsView.tsx
"use client";

import React, { useState } from 'react';
import { useInscriptionController } from '@/controllers/inscripcion_completa/useInscriptionController';
import { AdminLayout } from './components/login/AdminLayout';
import { InscriptionTable } from './components/inscripcion_completa/InscriptionTable';
import { InscriptionDetailModal } from './components/inscripcion_completa/InscriptionDetailModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, BarChart3 } from 'lucide-react';
import { EditInscriptionModal } from './components/inscripcion_completa/EditInscriptionModal';
import { DeleteInscriptionModal } from './components/inscripcion_completa/DeleteInscriptionModal';
import { EditInscriptionRequest } from '@/models/inscripcion_completa/inscription';
import ReportsView from './ReportsView';





export default function AccountantInscriptionsView() {
  const [activeTab, setActiveTab] = useState<'inscripciones' | 'informes'>('inscripciones');

  const {
    inscriptions,
    loading,
    message,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
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
    onPaymentValidated // 🆕 NUEVA FUNCIÓN
  } = useInscriptionController();

  const [forceRenderKey, setForceRenderKey] = React.useState(0);
  
  // ✅ FUNCIÓN MEJORADA PARA REFRESH
  const handleRefresh = async () => {
    setMessage(null);
    setForceRenderKey(prev => prev + 1);
    await forceRefresh(); // ✅ USAR forceRefresh EN LUGAR DE refreshInscriptions
    console.log('🔄 Tabla de contador refrescada manualmente');
  };

  // EFECTO PARA RE-RENDERIZAR CUANDO CAMBIAN LAS INSCRIPCIONES
  React.useEffect(() => {
    console.log('AccountantView: Inscripciones cambiaron, actualizando tabla');
    setForceRenderKey(prev => prev + 1);
  }, [inscriptions]);

  // FUNCION SIMPLE PARA ACTUALIZACIÓN SIN FORZAR RE-RENDER EXTRA
  const handleUpdateInscription = React.useCallback(async (updateData: EditInscriptionRequest) => {
    console.log('AccountantInscriptionsView: Procesando actualización...');
    
    try {
      await updateInscription(updateData);
      console.log('Actualización completada en AccountantView');
    } catch (error) {
      console.error('Error en handleUpdateInscription (AccountantView):', error);
    }
  }, [updateInscription]);

  return (
    <AdminLayout userType="accountant" activeModule="inscripciones">
      <div className="space-y-6">
        {/* Pestañas de navegación */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('inscripciones')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'inscripciones'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Inscripciones</span>
            </button>
            <button
              onClick={() => setActiveTab('informes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'informes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
               <span>Informes</span>
            </button>
          </nav>
        </div>

        {/* Contenido de pestañas */}
        {activeTab === 'inscripciones' && (
          <>
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

        {/* QUITAR: Estadísticas financieras - Solo mostrar total */}
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
            key={`accountant-inscriptions-${forceRenderKey}-${JSON.stringify(inscriptions.map(i => i.idInscripcion))}`}
          inscriptions={inscriptions}
          loading={loading}
          onViewDetails={viewInscriptionDetails}
          onEditInscription={openEditModal} // 🆕 NUEVA PROP
          onDeleteInscription={openDeleteModal} // 🆕 NUEVA PROP
          userType="accountant"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />

        {/* Modal de detalles - CON VALIDACIÓN DE PAGOS */}
        <InscriptionDetailModal
          inscription={selectedInscription}
          isOpen={!!selectedInscription}
          onClose={closeInscriptionDetails}
          userType="accountant"
          onPaymentValidated={onPaymentValidated}
        />
         {/* 🆕 NUEVO MODAL DE EDICIÓN */}
        <EditInscriptionModal
          inscription={selectedInscriptionForEdit}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onUpdate={handleUpdateInscription}
          userType="accountant"
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
          </>
        )}

        {/* Pestaña de Informes */}
        {activeTab === 'informes' && (
          <ReportsView />
        )}
      </div>
    </AdminLayout>
  );
}

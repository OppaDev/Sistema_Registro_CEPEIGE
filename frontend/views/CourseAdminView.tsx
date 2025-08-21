// views/CourseAdminView.tsx - CREAR ARCHIVO PRINCIPAL

"use client";

import React, { useState } from 'react';
import { useCourseAdminController } from '@/controllers/login/useCourseAdminController';
import { AdminLayout } from './components/login/AdminLayout';
import { CourseTable } from './components/curso_admin/CourseTable';
import { CourseDetailModal } from './components/curso_admin/CourseDetailModal';
import { CreateEditCourseModal } from './components/inscripcion_completa/CreateEditCourseModal';
import { DeleteCourseModal } from './components/curso_admin/DeleteCourseModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, BookOpen, TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { CreateCourseData, UpdateCourseData } from '@/models/inscripcion/course';
import ReportsView from './ReportsView';

export default function CourseAdminView() {
  const [activeTab, setActiveTab] = useState<'cursos' | 'informes'>('cursos');

  const {
    // Estado
    courses,
    selectedCourse,
    loading,
    message,
    
    // Paginación
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    
    // Modales
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isViewModalOpen,
    selectedCourseForEdit,
    selectedCourseForDelete,
    
    // Estados de operaciones
    isCreating,
    isUpdating,
    isDeleting,
    
    // Acciones
    refreshCourses,
    handlePageChange,
    setMessage,
    
    // CRUD
    createCourse,
    updateCourse,
    deleteCourse,
    
    // Modales
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openViewModal,
    closeViewModal,
  } = useCourseAdminController();

  const handleRefresh = () => {
    setMessage(null);
    refreshCourses();
  };
  const handleCourseSubmit = async (data: CreateCourseData | UpdateCourseData) => {
  if (selectedCourseForEdit) {
    // @ts-expect-error: forzamos el tipo correcto para update
    await updateCourse(data);
  } else {
    // @ts-expect-error: forzamos el tipo correcto para create
    await createCourse(data);
  }
};

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const now = new Date();
    const activeCourses = courses.filter(c => c.fechaInicioCurso <= now && c.fechaFinCurso >= now);
    const upcomingCourses = courses.filter(c => c.fechaInicioCurso > now);
    const totalRevenue = courses.reduce((sum, course) => sum + Number(course.valorCurso), 0);
    
    return {
      total: totalItems,
      active: activeCourses.length,
      upcoming: upcomingCourses.length,
      revenue: totalRevenue
    };
  }, [courses, totalItems]);

  return (
    <AdminLayout userType="admin" activeModule="cursos">
      <div className="space-y-6">
        {/* Pestañas de navegación */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('cursos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'cursos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Gestión de Cursos</span>
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
        {activeTab === 'cursos' && (
          <>
            {/* Encabezado */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 
                   className="text-2xl lg:text-3xl font-bold flex items-center"
                  style={{ 
                    color: '#000000',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700
                  }}
                >
                  <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 mr-2 lg:mr-3" style={{ color: '#F3762B' }} />
                  Gestión de Cursos
                </h1>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">
                  Administra los cursos disponibles en la plataforma
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
               className="flex items-center space-x-2 w-full lg:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>

        {/* Mensajes */}
        {message && (
          <Alert className={`border-l-4 ${
            message.type === 'success' 
              ? 'border-green-500 bg-green-50' 
              : message.type === 'error'
              ? 'border-red-500 bg-red-50'
              : 'border-blue-500 bg-blue-50'
          }`}>
            <AlertDescription className={
              message.type === 'success' 
                ? 'text-green-800' 
                : message.type === 'error'
                ? 'text-red-800'
                : 'text-blue-800'
            }>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cursos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.revenue.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabla de cursos */}
        <CourseTable
          courses={courses}
          loading={loading}
          onViewDetails={openViewModal}
          onEditCourse={openEditModal}
          onDeleteCourse={openDeleteModal}
          onCreateCourse={openCreateModal}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />

        {/* Modales */}
        <CourseDetailModal
          course={selectedCourse}
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
        />

            <CreateEditCourseModal
              isOpen={isCreateModalOpen || isEditModalOpen}
              course={selectedCourseForEdit}
               isSubmitting={isCreating || isUpdating}
               onSubmit={handleCourseSubmit}
               onClose={selectedCourseForEdit ? closeEditModal : closeCreateModal}
            />

            <DeleteCourseModal
              isOpen={isDeleteModalOpen}
              course={selectedCourseForDelete}
              isDeleting={isDeleting}
              onConfirm={deleteCourse}
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

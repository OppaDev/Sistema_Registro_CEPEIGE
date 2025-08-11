// controllers/useCourseAdminController.ts - NUEVO ARCHIVO

import { useState, useEffect, useCallback } from 'react';
import { Course, CreateCourseData, UpdateCourseData, CourseFilters } from '@/models/inscripcion/course';
import { courseService } from '@/services/inscripcion/courseService';

interface UseCourseAdminControllerReturn {
  // Estado
  courses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  message: { type: 'success' | 'error' | 'info'; text: string } | null;
  
  // Paginación
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filtros
  filters: CourseFilters;
  
  // Modales
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isViewModalOpen: boolean;
  selectedCourseForEdit: Course | null;
  selectedCourseForDelete: Course | null;
  
  // Estados de operaciones
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Acciones
  refreshCourses: () => Promise<void>;
  handlePageChange: (page: number) => void;
  setFilters: (filters: CourseFilters) => void;
  setMessage: (message: { type: 'success' | 'error' | 'info'; text: string } | null) => void;
  
  // CRUD
  createCourse: (courseData: CreateCourseData) => Promise<void>;
  updateCourse: (courseData: UpdateCourseData) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;
  
  // Modales
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (course: Course) => void;
  closeEditModal: () => void;
  openDeleteModal: (course: Course) => void;
  closeDeleteModal: () => void;
  openViewModal: (course: Course) => void;
  closeViewModal: () => void;
}

export const useCourseAdminController = (): UseCourseAdminControllerReturn => {
  // Estados principales
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Filtros
  const [filters, setFilters] = useState<CourseFilters>({});
  
  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<Course | null>(null);
  const [selectedCourseForDelete, setSelectedCourseForDelete] = useState<Course | null>(null);
  
  // Estados de operaciones
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar cursos
  const loadCourses = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setMessage(null);

      console.log('🔄 Cargando cursos - Página:', page, 'Filtros:', filters);

      const response = await courseService.getAllCoursesAdmin({
        page,
        limit: itemsPerPage,
        filters,
        orderBy: 'fechaInicioCurso',
        order: 'desc'
      });

      if (response.success) {
        setCourses(response.data);
        setCurrentPage(response.pagination?.page || page);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || response.data.length);

        console.log('✅ Cursos cargados:', {
          total: response.pagination?.total || response.data.length,
          page: response.pagination?.page || page,
          totalPages: response.pagination?.totalPages || 1,
          courses: response.data.length
        });

        if (response.data.length === 0 && page === 1) {
          setMessage({
            type: 'info',
            text: 'No hay cursos registrados aún.'
          });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('❌ Error cargando cursos:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al cargar los cursos'
      });
      setCourses([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, filters]);

  // Refrescar cursos
  const refreshCourses = useCallback(async () => {
    await loadCourses(currentPage);
  }, [loadCourses, currentPage]);

  // Cambiar página
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      loadCourses(page);
    }
  }, [loadCourses, totalPages, currentPage]);

  // RF-04.1 CREAR CURSO
  const createCourse = useCallback(async (courseData: CreateCourseData) => {
    try {
      setIsCreating(true);
      setMessage(null);

      console.log('🚀 Creando curso:', courseData);

      const response = await courseService.createCourse(courseData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: '✅ Curso creado exitosamente'
        });

        closeCreateModal();
        await new Promise(resolve => setTimeout(resolve, 100));
        await refreshCourses();

      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('❌ Error creando curso:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al crear el curso'
      });
    } finally {
      setIsCreating(false);
    }
  }, [refreshCourses]);

  // RF-04.3 ACTUALIZAR CURSO
  const updateCourse = useCallback(async (courseData: UpdateCourseData) => {
    try {
      setIsUpdating(true);
      setMessage(null);

      console.log('🔄 Actualizando curso:', courseData);

      const response = await courseService.updateCourse(courseData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: '✅ Curso actualizado exitosamente'
        });

        closeEditModal();
        await new Promise(resolve => setTimeout(resolve, 100));
        await refreshCourses();

      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('❌ Error actualizando curso:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al actualizar el curso'
      });
    } finally {
      setIsUpdating(false);
    }
  }, [refreshCourses]);

  // RF-04.4 ELIMINAR CURSO
  const deleteCourse = useCallback(async (courseId: number) => {
    try {
      setIsDeleting(true);
      setMessage(null);

      console.log('🗑️ Eliminando curso:', courseId);

      const response = await courseService.deleteCourse(courseId);

      if (response.success) {
        setMessage({
          type: 'success',
          text: '✅ Curso eliminado exitosamente'
        });

        closeDeleteModal();
        await new Promise(resolve => setTimeout(resolve, 100));
        await refreshCourses();

      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('❌ Error eliminando curso:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al eliminar el curso'
      });
    } finally {
      setIsDeleting(false);
    }
  }, [refreshCourses]);

  // Gestión de modales
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setMessage(null);
  }, []);

  const openEditModal = useCallback((course: Course) => {
    setSelectedCourseForEdit(course);
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setSelectedCourseForEdit(null);
    setIsEditModalOpen(false);
    setMessage(null);
  }, []);

  const openDeleteModal = useCallback((course: Course) => {
    if (!courseService.canDeleteCourse(course)) {
      setMessage({
        type: 'error',
        text: 'No se puede eliminar un curso que ya ha iniciado'
      });
      return;
    }
    setSelectedCourseForDelete(course);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setSelectedCourseForDelete(null);
    setIsDeleteModalOpen(false);
    setMessage(null);
  }, []);

  const openViewModal = useCallback((course: Course) => {
    setSelectedCourse(course);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setSelectedCourse(null);
    setIsViewModalOpen(false);
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCourses(1);
  }, [loadCourses]);

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
    courses,
    selectedCourse,
    loading,
    message,
    
    // Paginación
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    
    // Filtros
    filters,
    
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
    setFilters,
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
  };
};

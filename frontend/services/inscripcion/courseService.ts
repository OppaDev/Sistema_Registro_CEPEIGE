// services/courseService.ts - ACTUALIZAR SERVICIO COMPLETO
import { api } from '../api';
import { Course, CreateCourseData, UpdateCourseData, CourseFilters, CourseApiResponse } from '@/models/inscripcion/course';

class CourseService {
  private readonly baseUrl = '/cursos';

  // Función para convertir fecha ISO a fecha local (evita problemas de timezone)
  private parseLocalDate(dateInput: string | Date): Date {
    // Si ya es un Date, devolverlo tal como está
    if (dateInput instanceof Date) {
      return dateInput;
    }
    
    // Si es string, parsearlo
    const datePart = dateInput.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
  }

  // 🆕 RF-04.1 CREAR CURSO
  async createCourse(courseData: CreateCourseData): Promise<CourseApiResponse<Course>> {
    try {
      console.log('🚀 Creando nuevo curso:', courseData);
      
      const response = await api.post<CourseApiResponse<Course>>(this.baseUrl, courseData);
      
      console.log('📥 Respuesta crear curso:', response.data);
      
      if (response.data.success) {
        return {
          ...response.data,
          data: {
            ...response.data.data,
            fechaInicioCurso: this.parseLocalDate(response.data.data.fechaInicioCurso),
            fechaFinCurso: this.parseLocalDate(response.data.data.fechaFinCurso),
            valorCurso: Number(response.data.data.valorCurso)
          }
        };
      }
      
      throw new Error(response.data.message || 'Error al crear curso');
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string }; status?: number }; request?: unknown; message?: string };
      console.error('❌ Error creating course:', error);
      
      if (errorObj.response) {
        throw new Error(
          errorObj.response.data?.message || 
          `Error del servidor: ${errorObj.response.status}`
        );
      } else if (errorObj.request) {
        throw new Error('Error de conexión. Verifique que el servidor esté ejecutándose.');
      } else {
        throw new Error(errorObj.message || 'Error desconocido');
      }
    }
  }

  // 🆕 RF-04.2 OBTENER TODOS LOS CURSOS CON PAGINACIÓN
  async getAllCoursesAdmin(params: {
    page?: number;
    limit?: number;
    filters?: CourseFilters;
    orderBy?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<CourseApiResponse<Course[]>> {
    try {
      const {
        page = 1,
        limit = 10,
        filters = {},
        orderBy = 'fechaInicioCurso',
        order = 'desc'
      } = params;

      console.log('🚀 Obteniendo cursos para admin:', { page, limit, filters, orderBy, order });
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        orderBy,
        order,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      });

      const response = await api.get<CourseApiResponse<Course[]>>(`${this.baseUrl}?${queryParams}`);
      
      console.log('📥 Respuesta cursos admin:', response.data);
      
      if (response.data.success) {
        const courses = response.data.data.map(course => ({
          ...course,
          fechaInicioCurso: this.parseLocalDate(course.fechaInicioCurso),
          fechaFinCurso: this.parseLocalDate(course.fechaFinCurso),
          valorCurso: Number(course.valorCurso)
        }));
        
        return {
          ...response.data,
          data: courses
        };
      }
      
      throw new Error(response.data.message || 'Error al obtener cursos');
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      console.error('❌ Error fetching admin courses:', error);
      throw new Error(
        errorObj.response?.data?.message || 
        'Error de conexión al obtener cursos'
      );
    }
  }

  // 🆕 RF-04.3 ACTUALIZAR CURSO
  async updateCourse(courseData: UpdateCourseData): Promise<CourseApiResponse<Course>> {
    try {
      console.log('🚀 Actualizando curso:', courseData);
      
      const { idCurso, ...updateData } = courseData;
      
      const response = await api.put<CourseApiResponse<Course>>(`${this.baseUrl}/${idCurso}`, updateData);
      
      console.log('📥 Respuesta actualizar curso:', response.data);
      
      if (response.data.success) {
        return {
          ...response.data,
          data: {
            ...response.data.data,
            fechaInicioCurso: this.parseLocalDate(response.data.data.fechaInicioCurso),
            fechaFinCurso: this.parseLocalDate(response.data.data.fechaFinCurso),
            valorCurso: Number(response.data.data.valorCurso)
          }
        };
      }
      
      throw new Error(response.data.message || 'Error al actualizar curso');
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      console.error('❌ Error updating course:', error);
      throw new Error(errorObj.response?.data?.message || 'Error al actualizar curso');
    }
  }

  // 🆕 RF-04.4 ELIMINAR CURSO
  async deleteCourse(courseId: number): Promise<CourseApiResponse<Course>> {
    try {
      console.log('🗑️ Eliminando curso:', courseId);
      
      const response = await api.delete<CourseApiResponse<Course>>(`${this.baseUrl}/${courseId}`);
      
      console.log('📥 Respuesta eliminar curso:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar curso');
      }
      
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      console.error('❌ Error deleting course:', error);
      throw new Error(errorObj.response?.data?.message || 'Error al eliminar curso');
    }
  }

  // MÉTODOS EXISTENTES (mantener)
  async getAvailableCourses(): Promise<Course[]> {
    try {
      console.log('🚀 Obteniendo cursos disponibles...');
      const response = await api.get<CourseApiResponse<Course[]>>(`${this.baseUrl}/disponibles`);
      console.log('📥 Respuesta cursos:', response.data);
      if (response.data.success) {
        return response.data.data.map(course => ({
          idCurso: course.idCurso,
          nombreCortoCurso: course.nombreCortoCurso ?? '',
          modalidadCurso: course.modalidadCurso ?? '',
          nombreCurso: course.nombreCurso ?? '',
          valorCurso: Number(course.valorCurso),
          fechaInicioCurso: this.parseLocalDate(course.fechaInicioCurso),
          fechaFinCurso: this.parseLocalDate(course.fechaFinCurso),
          descripcionCurso: course.descripcionCurso ?? ''
        }));
      }
      throw new Error(response.data.message || 'Error al obtener cursos');
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string }; status?: number }; request?: unknown; message?: string };
      console.error('❌ Error fetching courses:', error);
      if (errorObj.response) {
        throw new Error(
          errorObj.response.data?.message || 
          `Error del servidor: ${errorObj.response.status}`
        );
      } else if (errorObj.request) {
        throw new Error('Error de conexión. Verifique que el servidor esté ejecutándose.');
      } else {
        throw new Error(errorObj.message || 'Error desconocido');
      }
    }
  }

  // 🆕 MÉTODO SIMPLE PARA OBTENER TODOS LOS CURSOS (para EditParticipantModal)
  async getAllCourses(): Promise<{ success: boolean; data?: Course[]; message?: string }> {
    try {
      console.log('📚 CourseService: Obteniendo todos los cursos...');
      
      const response = await api.get<CourseApiResponse<Course[]>>(`${this.baseUrl}`);
      
      console.log('📥 Respuesta completa de cursos:', response.data);

      if (response.data.success) {
        const courses = response.data.data.map(course => ({
          ...course,
          fechaInicioCurso: this.parseLocalDate(course.fechaInicioCurso),
          fechaFinCurso: this.parseLocalDate(course.fechaFinCurso),
          valorCurso: Number(course.valorCurso)
        }));
        
        console.log(`✅ ${courses.length} cursos obtenidos exitosamente`);

        return {
          success: true,
          data: courses,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al obtener cursos',
      };
    } catch (error: unknown) {
      const errorObj = error as { response?: { status?: number }; request?: unknown; message?: string };
      console.error('❌ Error en getAllCourses:', error);
      
      // Manejar errores de red
      if (errorObj.response) {
        const status = errorObj.response.status;
        if (status === 401) {
          return {
            success: false,
            message: 'No autorizado. Por favor, inicie sesión nuevamente.',
          };
        }
        if (status === 403) {
          return {
            success: false,
            message: 'No tiene permisos para ver los cursos.',
          };
        }
        return {
          success: false,
          message: `Error del servidor: ${status}`,
        };
      } else if (errorObj.request) {
        return {
          success: false,
          message: 'Error de conexión. Verifique su conexión a internet.',
        };
      }

      return {
        success: false,
        message: errorObj.message || 'Error inesperado al obtener cursos',
      };
    }
  }

  async getCourseById(id: number): Promise<Course> {
    try {
      console.log('🚀 Obteniendo curso por ID:', id);
      
      const response = await api.get<CourseApiResponse<Course>>(`${this.baseUrl}/${id}`);
      
      console.log('📥 Respuesta curso:', response.data);
      
      if (response.data.success) {
        const course = response.data.data;
        return {
          ...course,
          fechaInicioCurso: this.parseLocalDate(course.fechaInicioCurso),
          fechaFinCurso: this.parseLocalDate(course.fechaFinCurso),
          valorCurso: Number(course.valorCurso)
        };
      }
      
      throw new Error(response.data.message || 'Error al obtener curso');
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string }; status?: number }; request?: unknown; message?: string };
      console.error('❌ Error fetching course:', error);
      
      if (errorObj.response) {
        throw new Error(
          errorObj.response.data?.message || 
          `Error del servidor: ${errorObj.response.status}`
        );
      } else if (errorObj.request) {
        throw new Error('Error de conexión. Verifique que el servidor esté ejecutándose.');
      } else {
        throw new Error(errorObj.message || 'Error desconocido');
      }
    }
  }

  // 🆕 MÉTODOS AUXILIARES
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(date: Date): string {
    // Asegurar que se use la fecha local sin conversión de timezone
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      timeZone: 'America/Guayaquil' // Zona horaria de Ecuador
    }).format(date);
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  calculateDuration(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  canDeleteCourse(): boolean {
    // ✅ Permitir eliminar cualquier curso (incluidos los que ya pasaron)
    // El administrador tiene control total sobre la gestión de cursos
    return true;
  }

  getModalidadBadge(modalidad: string) {
    switch (modalidad) {
      case 'PRESENCIAL':
        return {
          color: 'text-blue-800',
          bgColor: 'bg-blue-100',
          text: 'Presencial'
        };
      case 'VIRTUAL':
        return {
          color: 'text-green-800',
          bgColor: 'bg-green-100',
          text: 'Virtual'
        };
      case 'SEMIPRESENCIAL':
        return {
          color: 'text-purple-800',
          bgColor: 'bg-purple-100',
          text: 'Semipresencial'
        };
      case 'HÍBRIDO':
        return {
          color: 'text-orange-800',
          bgColor: 'bg-orange-100',
          text: 'Híbrido'
        };
      default:
        return {
          color: 'text-gray-800',
          bgColor: 'bg-gray-100',
          text: modalidad
        };
    }
  }
}

export const courseService = new CourseService();

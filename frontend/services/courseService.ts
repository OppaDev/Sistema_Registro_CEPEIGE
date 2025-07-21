// services/courseService.ts - ACTUALIZAR SERVICIO COMPLETO
import { api } from './api';
import { Course, CreateCourseData, UpdateCourseData, CourseFilters, CourseApiResponse } from '@/models/course';

class CourseService {
  private readonly baseUrl = '/cursos';

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
            fechaInicioCurso: new Date(response.data.data.fechaInicioCurso),
            fechaFinCurso: new Date(response.data.data.fechaFinCurso),
            valorCurso: Number(response.data.data.valorCurso)
          }
        };
      }
      
      throw new Error(response.data.message || 'Error al crear curso');
    } catch (error: any) {
      console.error('❌ Error creating course:', error);
      
      if (error.response) {
        throw new Error(
          error.response.data?.message || 
          `Error del servidor: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error('Error de conexión. Verifique que el servidor esté ejecutándose.');
      } else {
        throw new Error(error.message || 'Error desconocido');
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
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await api.get<CourseApiResponse<Course[]>>(`${this.baseUrl}?${queryParams}`);
      
      console.log('📥 Respuesta cursos admin:', response.data);
      
      if (response.data.success) {
        const courses = response.data.data.map(course => ({
          ...course,
          fechaInicioCurso: new Date(course.fechaInicioCurso),
          fechaFinCurso: new Date(course.fechaFinCurso),
          valorCurso: Number(course.valorCurso)
        }));
        
        return {
          ...response.data,
          data: courses
        };
      }
      
      throw new Error(response.data.message || 'Error al obtener cursos');
    } catch (error: any) {
      console.error('❌ Error fetching admin courses:', error);
      throw new Error(
        error.response?.data?.message || 
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
            fechaInicioCurso: new Date(response.data.data.fechaInicioCurso),
            fechaFinCurso: new Date(response.data.data.fechaFinCurso),
            valorCurso: Number(response.data.data.valorCurso)
          }
        };
      }
      
      throw new Error(response.data.message || 'Error al actualizar curso');
    } catch (error: any) {
      console.error('❌ Error updating course:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar curso');
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
    } catch (error: any) {
      console.error('❌ Error deleting course:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar curso');
    }
  }

  // MÉTODOS EXISTENTES (mantener)
  async getAvailableCourses(): Promise<Course[]> {
    try {
      console.log('🚀 Obteniendo cursos disponibles...');
      const response = await api.get<CourseApiResponse<any[]>>(`${this.baseUrl}/disponibles`);
      console.log('📥 Respuesta cursos:', response.data);
      if (response.data.success) {
        return response.data.data.map(course => ({
          idCurso: course.idCurso,
          nombreCortoCurso: course.nombreCortoCurso ?? '',
          modalidadCurso: course.modalidadCurso ?? '',
          nombreCurso: course.nombreCurso ?? '',
          valorCurso: Number(course.valorCurso),
          fechaInicioCurso: new Date(course.fechaInicioCurso),
          fechaFinCurso: new Date(course.fechaFinCurso),
          descripcionCurso: course.descripcionCurso ?? ''
        }));
      }
      throw new Error(response.data.message || 'Error al obtener cursos');
    } catch (error: any) {
      console.error('❌ Error fetching courses:', error);
      if (error.response) {
        throw new Error(
          error.response.data?.message || 
          `Error del servidor: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error('Error de conexión. Verifique que el servidor esté ejecutándose.');
      } else {
        throw new Error(error.message || 'Error desconocido');
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
          fechaInicioCurso: new Date(course.fechaInicioCurso),
          fechaFinCurso: new Date(course.fechaFinCurso),
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
    } catch (error: any) {
      console.error('❌ Error en getAllCourses:', error);
      
      // Manejar errores de red
      if (error.response) {
        const status = error.response.status;
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
      } else if (error.request) {
        return {
          success: false,
          message: 'Error de conexión. Verifique su conexión a internet.',
        };
      }

      return {
        success: false,
        message: error.message || 'Error inesperado al obtener cursos',
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
          fechaInicioCurso: new Date(course.fechaInicioCurso),
          fechaFinCurso: new Date(course.fechaFinCurso),
          valorCurso: Number(course.valorCurso)
        };
      }
      
      throw new Error(response.data.message || 'Error al obtener curso');
    } catch (error: any) {
      console.error('❌ Error fetching course:', error);
      
      if (error.response) {
        throw new Error(
          error.response.data?.message || 
          `Error del servidor: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error('Error de conexión. Verifique que el servidor esté ejecutándose.');
      } else {
        throw new Error(error.message || 'Error desconocido');
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
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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

  canDeleteCourse(course: Course): boolean {
    // Un curso se puede eliminar si la fecha de inicio es futura
    const now = new Date();
    return course.fechaInicioCurso > now;
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

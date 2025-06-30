// services/courseService.ts 
import { api } from './api';
import { Course, CourseAvailable } from '@/models/course';
 // Asegúrate de que este modelo esté actualizado

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class CourseService {
  private readonly baseUrl = '/cursos';

  async getAvailableCourses(): Promise<Course[]> {
    try {
      console.log('🚀 Obteniendo cursos disponibles...');
      
      const response = await api.get<ApiResponse<CourseAvailable[]>>(`${this.baseUrl}/disponibles`);
      
      console.log('📥 Respuesta cursos:', response.data);
      
      if (response.data.success) {
        return response.data.data.map(course => ({
          idCurso: course.idCurso,
          nombreCortoCurso:'', // Los cursos disponibles no incluyen nombre corto
          modalidadCurso: course.modalidadCurso, // Asegúrate de que este campo exista en el backend
          nombreCurso: course.nombreCurso,
          valorCurso: Number(course.valorCurso),
          fechaInicioCurso: new Date(course.fechaInicioCurso),
          fechaFinCurso: new Date(course.fechaFinCurso),
          descripcionCurso: '' // Los cursos disponibles no incluyen descripción
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

  async getCourseById(id: number): Promise<Course> {
    try {
      console.log('🚀 Obteniendo curso por ID:', id);
      
      const response = await api.get<ApiResponse<Course>>(`${this.baseUrl}/${id}`);
      
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

  async getAllCourses(page: number = 1, limit: number = 10): Promise<{ courses: Course[]; total: number }> {
    try {
      console.log('🚀 Obteniendo todos los cursos...');
      
      const response = await api.get<ApiResponse<Course[]>>(`${this.baseUrl}?page=${page}&limit=${limit}`);
      
      if (response.data.success) {
        const courses = response.data.data.map(course => ({
          ...course,
          fechaInicioCurso: new Date(course.fechaInicioCurso),
          fechaFinCurso: new Date(course.fechaFinCurso),
          valorCurso: Number(course.valorCurso)
        }));
        
        return {
          courses,
          total: response.data.pagination?.total || courses.length
        };
      }
      
      throw new Error(response.data.message || 'Error al obtener cursos');
    } catch (error: any) {
      console.error('❌ Error fetching all courses:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error de conexión al obtener cursos'
      );
    }
  }
   async createCourse(course: Partial<Course>): Promise<Course> {
    try {
      const response = await api.post<ApiResponse<Course>>(this.baseUrl, course);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al crear curso');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear curso');
    }
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course> {
    try {
      const response = await api.put<ApiResponse<Course>>(`${this.baseUrl}/${id}`, course);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al actualizar curso');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar curso');
    }
  }

  async deleteCourse(id: number): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar curso');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar curso');
    }
  }

}

export const courseService = new CourseService();

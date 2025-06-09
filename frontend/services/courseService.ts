// services/courseService.ts
import { api } from './api';
import { Course } from '@/models/course';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class CourseService {
  private readonly baseUrl = '/cursos';

  async getAvailableCourses(): Promise<Course[]> {
    try {
      const response = await api.get<ApiResponse<Course[]>>(`${this.baseUrl}/disponibles`);
      
      if (response.data.success) {
        return response.data.data.map(course => ({
          ...course,
          fechaInicioCurso: new Date(course.fechaInicioCurso),
          fechaFinCurso: new Date(course.fechaFinCurso),
          valorCurso: Number(course.valorCurso)
        }));
      }
      
      throw new Error(response.data.message || 'Error al obtener cursos');
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error de conexión al obtener cursos'
      );
    }
  }

  async getCourseById(id: number): Promise<Course> {
    try {
      const response = await api.get<ApiResponse<Course>>(`${this.baseUrl}/${id}`);
      
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
      console.error('Error fetching course:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error de conexión al obtener curso'
      );
    }
  }
}

export const courseService = new CourseService();

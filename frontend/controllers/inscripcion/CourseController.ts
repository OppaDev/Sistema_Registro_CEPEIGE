// controllers/CourseController.ts
import { useState, useEffect } from 'react';
import { Course } from '@/models/inscripcion/course';
import { courseService } from '@/services/inscripcion/courseService';

export interface CourseControllerState {
  courses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string;
}

export class CourseController {
  private setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  private setSelectedCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  private setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  private setError: React.Dispatch<React.SetStateAction<string>>;

  constructor(
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>,
    setSelectedCourse: React.Dispatch<React.SetStateAction<Course | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string>>
  ) {
    this.setCourses = setCourses;
    this.setSelectedCourse = setSelectedCourse;
    this.setLoading = setLoading;
    this.setError = setError;
  }

  async loadAvailableCourses(): Promise<void> {
    try {
      this.setLoading(true);
      this.setError('');
      
      const courses = await courseService.getAvailableCourses();
      this.setCourses(courses);
      
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('Error loading courses:', error);
      this.setError(errorObj.message || 'Error al cargar cursos');
    } finally {
      this.setLoading(false);
    }
  }

  selectCourse(course: Course): void {
    this.setSelectedCourse(course);
    this.setError('');
  }

  clearSelection(): void {
    this.setSelectedCourse(null);
  }

  async getCourseById(id: number): Promise<Course | null> {
    try {
      return await courseService.getCourseById(id);
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('Error fetching course by ID:', error);
      this.setError(errorObj.message || 'Error al obtener curso');
      return null;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  formatDateRange(startDate: Date, endDate: Date): string {
    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);
    return `${start} - ${end}`;
  }

  isCourseAvailable(course: Course): boolean {
    const now = new Date();
    return course.fechaInicioCurso > now;
  }

  getDuration(course: Course): number {
    const start = course.fechaInicioCurso.getTime();
    const end = course.fechaFinCurso.getTime();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // días
  }
}

// Hook personalizado para usar el CourseController
export function useCourseController() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const controller = new CourseController(
    setCourses,
    setSelectedCourse,
    setLoading,
    setError
  );

  // Auto-cargar cursos al montar el componente
  useEffect(() => {
    controller.loadAvailableCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Estado
    courses,
    selectedCourse,
    loading,
    error,
    
    // Acciones del controller
    loadCourses: () => controller.loadAvailableCourses(),
    selectCourse: (course: Course) => controller.selectCourse(course),
    clearSelection: () => controller.clearSelection(),
    getCourseById: (id: number) => controller.getCourseById(id),
    
    // Utilidades
    formatPrice: (price: number) => controller.formatPrice(price),
    formatDate: (date: Date) => controller.formatDate(date),
    formatDateRange: (start: Date, end: Date) => controller.formatDateRange(start, end),
    isCourseAvailable: (course: Course) => controller.isCourseAvailable(course),
    getDuration: (course: Course) => controller.getDuration(course)
  };
}

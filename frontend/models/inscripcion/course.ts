// models/course.ts - REEMPLAZAR COMPLETO
export interface Course {
  idCurso: number;              // ✅ Según backend
  nombreCortoCurso: string;
  nombreCurso: string;
  descripcionCurso: string;
  modalidadCurso: string;
  valorCurso: number;         // ✅ Según backend
  enlacePago: string;           // ✅ Nuevo campo según backend
  fechaInicioCurso: Date;       // ✅ Según backend
  fechaFinCurso: Date;          // ✅ Según backend
}

// ✅ NUEVA INTERFAZ según backend
export interface CourseAvailable {
  idCurso: number;
  nombreCortoCurso: string;
  nombreCurso: string;
  descripcionCurso: string;
  modalidadCurso: string;
  valorCurso: number;
  enlacePago: string;           // ✅ Nuevo campo según backend
  fechaInicioCurso: Date;
  fechaFinCurso: Date;
}

export interface CourseSelection {
  courseId: number;
  courseName: string;
  coursePrice: number;
  enlacePago: string;
}
export interface CreateCourseData {
  nombreCortoCurso: string;
  nombreCurso: string;
  descripcionCurso: string;
  modalidadCurso: string;
  valorCurso: number;
  enlacePago: string;       // ✅ Nuevo campo según backend
  fechaInicioCurso: string; // ISO string para API
  fechaFinCurso: string;    // ISO string para API
}

// 🆕 NUEVA INTERFAZ PARA ACTUALIZAR CURSO
export interface UpdateCourseData extends Partial<CreateCourseData> {
  idCurso: number;
}

// 🆕 INTERFAZ PARA FILTROS
export interface CourseFilters {
  modalidad?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
}

// 🆕 CONSTANTES según backend
export const MODALIDADES_CURSO = [
  'PRESENCIAL',
  'VIRTUAL',
  'SEMIPRESENCIAL',
  'HÍBRIDO'
] as const;

// 🆕 RESPUESTA DE LA API
export interface CourseApiResponse<T> {
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

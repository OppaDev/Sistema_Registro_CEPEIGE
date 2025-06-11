// models/course.ts - REEMPLAZAR COMPLETO
export interface Course {
  idCurso: number;              // ✅ Según backend
  nombreCurso: string;          // ✅ Según backend  
  descripcionCurso?: string;    // ✅ Según backend
  valorCurso: number;           // ✅ Según backend
  fechaInicioCurso: Date;       // ✅ Según backend
  fechaFinCurso: Date;          // ✅ Según backend
}

// ✅ NUEVA INTERFAZ según backend
export interface CourseAvailable {
  idCurso: number;
  nombreCurso: string;
  valorCurso: number;
  fechaInicioCurso: Date;
  fechaFinCurso: Date;
}

export interface CourseSelection {
  courseId: number;
  courseName: string;
  coursePrice: number;
}

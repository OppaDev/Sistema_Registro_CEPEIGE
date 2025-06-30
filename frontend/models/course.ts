// models/course.ts - REEMPLAZAR COMPLETO
export interface Course {
  idCurso: number;              // ✅ Según backend
  nombreCortoCurso: string;
  nombreCurso: string;
  descripcionCurso: string;
  modalidadCurso: string;
  valorCurso: number;         // ✅ Según backend
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
  fechaInicioCurso: Date;
  fechaFinCurso: Date;
}

export interface CourseSelection {
  courseId: number;
  courseName: string;
  coursePrice: number;
}

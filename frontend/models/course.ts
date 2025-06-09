// frontend/models/course.ts
export interface Course {
  idCurso: number;
  nombreCurso: string;
  descripcionCurso?: string;
  valorCurso: number;
  fechaInicioCurso: Date;
  fechaFinCurso: Date;
}

export interface CourseSelection {
  courseId: number;
  courseName: string;
  coursePrice: number;
}

export interface ApiCourse {
  idCurso: number;
  nombreCurso: string;
  descripcionCurso?: string;
  valorCurso: string | number; // Puede venir como string del backend
  fechaInicioCurso: string | Date;
  fechaFinCurso: string | Date;
}

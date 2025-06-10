// models/course.ts
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

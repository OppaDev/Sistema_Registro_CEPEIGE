export interface Curso {
  idCurso: number;
  nombreCortoCurso: string;
  nombreCurso: string;
  descripcionCurso: string;
  valorCurso: number;
  fechaInicioCurso: Date;
  fechaFinCurso: Date;
}

export interface CursoConInscripciones extends Curso {
  inscripciones: Inscripcion[];
}
import { CursoMoodle as PrismaCursoMoodle, Curso as PrismaCurso } from "@prisma/client";
import { 
  CursoMoodleResponseDto, 
  CursoMoodleWithCursoDto 
} from "@/api/dtos/integrationDto/cursoMoodle.dto";

export type PrismaCursoMoodleConCurso = PrismaCursoMoodle & {
  curso: PrismaCurso;
};

export const toCursoMoodleResponseDto = (cursoMoodle: PrismaCursoMoodle): CursoMoodleResponseDto => {
  return {
    idCursoMoodle: cursoMoodle.idCursoMoodle,
    idCurso: cursoMoodle.idCurso,
    moodleCursoId: cursoMoodle.moodleCursoId,
    nombreCortoMoodle: cursoMoodle.nombreCortoMoodle,
    fechaCreacion: cursoMoodle.fechaCreacion,
    fechaActualizacion: cursoMoodle.fechaActualizacion,
    activo: cursoMoodle.activo,
  };
};

export const toCursoMoodleWithCursoDto = (cursoMoodleConCurso: PrismaCursoMoodleConCurso): CursoMoodleWithCursoDto => {
  return {
    idCursoMoodle: cursoMoodleConCurso.idCursoMoodle,
    idCurso: cursoMoodleConCurso.idCurso,
    moodleCursoId: cursoMoodleConCurso.moodleCursoId,
    nombreCortoMoodle: cursoMoodleConCurso.nombreCortoMoodle,
    fechaCreacion: cursoMoodleConCurso.fechaCreacion,
    fechaActualizacion: cursoMoodleConCurso.fechaActualizacion,
    activo: cursoMoodleConCurso.activo,
    curso: {
      idCurso: cursoMoodleConCurso.curso.idCurso,
      nombreCortoCurso: cursoMoodleConCurso.curso.nombreCortoCurso,
      nombreCurso: cursoMoodleConCurso.curso.nombreCurso,
      modalidadCurso: cursoMoodleConCurso.curso.modalidadCurso,
      fechaInicioCurso: cursoMoodleConCurso.curso.fechaInicioCurso,
      fechaFinCurso: cursoMoodleConCurso.curso.fechaFinCurso,
    },
  };
};
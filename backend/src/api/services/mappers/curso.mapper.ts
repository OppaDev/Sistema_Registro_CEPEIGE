import { Curso as PrismaCurso } from "@prisma/client";
import { CursoResponseDto } from "@/api/dtos/curso.dto";

export const toCursoResponseDto = (curso: PrismaCurso): CursoResponseDto => {
  return {
    idCurso: curso.idCurso,
    nombreCortoCurso: curso.nombreCortoCurso,
    nombreCurso: curso.nombreCurso,
    descripcionCurso: curso.descripcionCurso,
    valorCurso: curso.valorCurso,
    fechaInicioCurso: curso.fechaInicioCurso,
    fechaFinCurso: curso.fechaFinCurso,
  };
};

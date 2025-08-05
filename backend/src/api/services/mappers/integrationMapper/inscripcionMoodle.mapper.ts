import { 
  InscripcionMoodle as PrismaInscripcionMoodle, 
  Inscripcion as PrismaInscripcion,
  DatosPersonales as PrismaDatosPersonales,
  Curso as PrismaCurso
} from "@prisma/client";
import { 
  InscripcionMoodleResponseDto, 
  InscripcionMoodleWithInscripcionDto,
  EstadoMatriculaMoodle
} from "@/api/dtos/integrationDto/inscripcionMoodle.dto";

export type PrismaInscripcionMoodleConInscripcion = PrismaInscripcionMoodle & {
  inscripcion: PrismaInscripcion & {
    persona: PrismaDatosPersonales;
    curso: PrismaCurso;
  };
};

export const toInscripcionMoodleResponseDto = (inscripcionMoodle: PrismaInscripcionMoodle): InscripcionMoodleResponseDto => {
  return {
    idInscripcionMoodle: inscripcionMoodle.idInscripcionMoodle,
    idInscripcion: inscripcionMoodle.idInscripcion,
    moodleUserId: inscripcionMoodle.moodleUserId,
    moodleUsername: inscripcionMoodle.moodleUsername,
    estadoMatricula: inscripcionMoodle.estadoMatricula as EstadoMatriculaMoodle,
    fechaMatricula: inscripcionMoodle.fechaMatricula,
    fechaActualizacion: inscripcionMoodle.fechaActualizacion,
    notas: inscripcionMoodle.notas,
  };
};

export const toInscripcionMoodleWithInscripcionDto = (inscripcionMoodleConInscripcion: PrismaInscripcionMoodleConInscripcion): InscripcionMoodleWithInscripcionDto => {
  return {
    idInscripcionMoodle: inscripcionMoodleConInscripcion.idInscripcionMoodle,
    idInscripcion: inscripcionMoodleConInscripcion.idInscripcion,
    moodleUserId: inscripcionMoodleConInscripcion.moodleUserId,
    moodleUsername: inscripcionMoodleConInscripcion.moodleUsername,
    estadoMatricula: inscripcionMoodleConInscripcion.estadoMatricula as EstadoMatriculaMoodle,
    fechaMatricula: inscripcionMoodleConInscripcion.fechaMatricula,
    fechaActualizacion: inscripcionMoodleConInscripcion.fechaActualizacion,
    notas: inscripcionMoodleConInscripcion.notas,
    inscripcion: {
      idInscripcion: inscripcionMoodleConInscripcion.inscripcion.idInscripcion,
      matricula: inscripcionMoodleConInscripcion.inscripcion.matricula,
      fechaInscripcion: inscripcionMoodleConInscripcion.inscripcion.fechaInscripcion,
      persona: {
        nombres: inscripcionMoodleConInscripcion.inscripcion.persona.nombres,
        apellidos: inscripcionMoodleConInscripcion.inscripcion.persona.apellidos,
        correo: inscripcionMoodleConInscripcion.inscripcion.persona.correo,
        ciPasaporte: inscripcionMoodleConInscripcion.inscripcion.persona.ciPasaporte,
      },
      curso: {
        idCurso: inscripcionMoodleConInscripcion.inscripcion.curso.idCurso,
        nombreCortoCurso: inscripcionMoodleConInscripcion.inscripcion.curso.nombreCortoCurso,
        nombreCurso: inscripcionMoodleConInscripcion.inscripcion.curso.nombreCurso,
      },
    },
  };
};
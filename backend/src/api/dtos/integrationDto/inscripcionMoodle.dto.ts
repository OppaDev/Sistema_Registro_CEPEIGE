import { IsString, IsNumber, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum EstadoMatriculaMoodle {
  MATRICULADO = 'matriculado',
  SUSPENDIDO = 'suspendido',
  COMPLETADO = 'completado',
  DESMATRICULADO = 'desmatriculado'
}

export class CreateInscripcionMoodleDto {
  @IsNumber({}, { message: 'El ID de la inscripción debe ser un número' })
  @IsNotEmpty({ message: 'El ID de la inscripción es requerido' })
  idInscripcion!: number;

  @IsNumber({}, { message: 'El ID del usuario en Moodle debe ser un número' })
  @IsNotEmpty({ message: 'El ID del usuario en Moodle es requerido' })
  moodleUserId!: number;

  @IsString({ message: 'El nombre de usuario en Moodle debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario en Moodle es requerido' })
  moodleUsername!: string;

  @IsEnum(EstadoMatriculaMoodle, { message: 'El estado de matrícula debe ser un valor válido' })
  @IsOptional()
  estadoMatricula?: EstadoMatriculaMoodle;

  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @IsOptional()
  notas?: string;
}

export class UpdateInscripcionMoodleDto {
  @IsNumber({}, { message: 'El ID del usuario en Moodle debe ser un número' })
  @IsOptional()
  moodleUserId?: number;

  @IsString({ message: 'El nombre de usuario en Moodle debe ser una cadena de texto' })
  @IsOptional()
  moodleUsername?: string;

  @IsEnum(EstadoMatriculaMoodle, { message: 'El estado de matrícula debe ser un valor válido' })
  @IsOptional()
  estadoMatricula?: EstadoMatriculaMoodle;

  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @IsOptional()
  notas?: string;
}

export class InscripcionMoodleResponseDto {
  idInscripcionMoodle!: number;
  idInscripcion!: number;
  moodleUserId!: number;
  moodleUsername!: string;
  estadoMatricula!: EstadoMatriculaMoodle;
  fechaMatricula!: Date;
  fechaActualizacion!: Date;
  notas?: string | null;
}

export class InscripcionMoodleWithInscripcionDto extends InscripcionMoodleResponseDto {
  inscripcion!: {
    idInscripcion: number;
    matricula: boolean;
    fechaInscripcion: Date;
    persona: {
      nombres: string;
      apellidos: string;
      correo: string;
      ciPasaporte: string;
    };
    curso: {
      idCurso: number;
      nombreCortoCurso: string;
      nombreCurso: string;
    };
  };
}
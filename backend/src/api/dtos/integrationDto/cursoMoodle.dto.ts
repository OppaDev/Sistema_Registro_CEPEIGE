import { IsString, IsNumber, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCursoMoodleDto {
  @IsNumber({}, { message: 'El ID del curso debe ser un número' })
  @IsNotEmpty({ message: 'El ID del curso es requerido' })
  idCurso!: number;

  @IsNumber({}, { message: 'El ID del curso en Moodle debe ser un número' })
  @IsNotEmpty({ message: 'El ID del curso en Moodle es requerido' })
  moodleCursoId!: number;

  @IsString({ message: 'El nombre corto en Moodle debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre corto en Moodle es requerido' })
  nombreCortoMoodle!: string;

  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  activo?: boolean;
}

export class UpdateCursoMoodleDto {
  @IsNumber({}, { message: 'El ID del curso en Moodle debe ser un número' })
  @IsOptional()
  moodleCursoId?: number;

  @IsString({ message: 'El nombre corto en Moodle debe ser una cadena de texto' })
  @IsOptional()
  nombreCortoMoodle?: string;

  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  activo?: boolean;
}

export class CursoMoodleResponseDto {
  idCursoMoodle!: number;
  idCurso!: number;
  moodleCursoId!: number;
  nombreCortoMoodle!: string;
  fechaCreacion!: Date;
  fechaActualizacion!: Date;
  activo!: boolean;
}

export class CursoMoodleWithCursoDto extends CursoMoodleResponseDto {
  curso!: {
    idCurso: number;
    nombreCortoCurso: string;
    nombreCurso: string;
    modalidadCurso: string;
    fechaInicioCurso: Date;
    fechaFinCurso: Date;
  };
}
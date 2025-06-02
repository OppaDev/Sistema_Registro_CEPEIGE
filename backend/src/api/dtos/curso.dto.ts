import { IsString, IsNumber, IsNotEmpty, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCursoDto {
  @IsString({ message: 'El nombre corto del curso debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre corto del curso es requerido' })
  nombreCortoCurso!: string;

  @IsString({ message: 'El nombre del curso debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del curso es requerido' })
  nombreCurso!: string;

  @IsString({ message: 'La descripción del curso debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción del curso es requerida' })
  descripcionCurso!: string;

  @IsNumber({}, { message: 'El valor del curso debe ser un número' })
  @IsNotEmpty({ message: 'El valor del curso es requerido' })
  @Type(() => Number)
  valorCurso!: number;

  @IsISO8601({}, { message: 'La fecha de inicio debe ser una fecha válida en formato ISO' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fechaInicioCurso!: string;

  @IsISO8601({}, { message: 'La fecha de fin debe ser una fecha válida en formato ISO' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  fechaFinCurso!: string;
} 
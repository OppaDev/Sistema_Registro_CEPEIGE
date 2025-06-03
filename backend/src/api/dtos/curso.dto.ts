import { IsString, IsNumber, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

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
  @Type(() => Decimal)
  valorCurso!: Decimal;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida en formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fechaInicioCurso!: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida en formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  fechaFinCurso!: string;
} 

export class UpdateCursoDto {
  @IsString({ message: 'El nombre corto del curso debe ser una cadena de texto' })
  @IsOptional()
  nombreCortoCurso?: string;

  @IsString({ message: 'El nombre del curso debe ser una cadena de texto' })
  @IsOptional()
  nombreCurso?: string;

  @IsString({ message: 'La descripción del curso debe ser una cadena de texto' })
  @IsOptional()
  descripcionCurso?: string;

  @IsNumber({}, { message: 'El valor del curso debe ser un número' })
  @IsOptional()
  @Type(() => Decimal)
  valorCurso?: Decimal;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida en formato YYYY-MM-DD' })
  @IsOptional()
  fechaInicioCurso?: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida en formato YYYY-MM-DD' })
  @IsOptional()
  fechaFinCurso?: string;
}

export class CursoResponseDto {
  idCurso!: number;
  nombreCortoCurso!: string;
  nombreCurso!: string;
  descripcionCurso!: string;
  valorCurso!: Decimal;
  fechaInicioCurso!: Date;
  fechaFinCurso!: Date;
}

export class CursosDisponiblesDto {
  idCurso!: number;
  nombreCurso!: string;
  valorCurso!: Decimal;
  fechaInicioCurso!: Date;
  fechaFinCurso!: Date;
}

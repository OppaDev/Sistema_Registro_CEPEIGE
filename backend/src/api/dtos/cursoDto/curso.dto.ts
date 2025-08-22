import { IsString, IsNumber, IsNotEmpty, IsDateString, IsOptional} from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';
import { IsDateBefore, IsDateAfter, IsDateFromToday } from '@/utils/validators/dateValidators';

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

  @IsString({ message: 'La modalidad del curso debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La modalidad del curso es requerida' })  
  modalidadCurso!: string;

  @IsNumber({}, { message: 'El valor del curso debe ser un número' })
  @IsNotEmpty({ message: 'El valor del curso es requerido' })
  @Type(() => Decimal)
  valorCurso!: Decimal;

  @IsString({ message: 'El enlace de pago debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El enlace de pago es requerido' })
  enlacePago!: string;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida en formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateFromToday({ message: 'La fecha de inicio debe ser mayor o igual a la fecha actual' })
  @IsDateBefore('fechaFinCurso', { message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin' })
  fechaInicioCurso!: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida en formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateAfter('fechaInicioCurso', { message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' })
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

  @IsString({ message: 'La modalidad del curso debe ser una cadena de texto' })
  @IsOptional()
  modalidadCurso?: string;

  @IsNumber({}, { message: 'El valor del curso debe ser un número' })
  @IsOptional()
  @Type(() => Decimal)
  valorCurso?: Decimal;

  @IsString({ message: 'El enlace de pago debe ser una cadena de texto' })
  @IsOptional()
  enlacePago?: string;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida en formato YYYY-MM-DD' })
  @IsOptional()
  @IsDateFromToday({ message: 'La fecha de inicio debe ser mayor o igual a la fecha actual' })
  @IsDateBefore('fechaFinCurso', { message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin' })
  fechaInicioCurso?: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida en formato YYYY-MM-DD' })
  @IsOptional()
  @IsDateAfter('fechaInicioCurso', { message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' })
  fechaFinCurso?: string;
}

export class CursoResponseDto {
  idCurso!: number;
  nombreCortoCurso!: string;
  nombreCurso!: string;
  modalidadCurso!: string;
  descripcionCurso!: string;
  valorCurso!: Decimal;
  enlacePago!: string;
  fechaInicioCurso!: Date;
  fechaFinCurso!: Date;
}

export class CursosDisponiblesDto {
  idCurso!: number;
  nombreCurso!: string;
  modalidadCurso!: string;
  valorCurso!: Decimal;
  enlacePago!: string;
  fechaInicioCurso!: Date;
  fechaFinCurso!: Date;
}

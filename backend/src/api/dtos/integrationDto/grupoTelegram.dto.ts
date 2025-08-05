import { IsString, IsNumber, IsNotEmpty, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateGrupoTelegramDto {
  @IsNumber({}, { message: 'El ID del curso debe ser un número' })
  @IsNotEmpty({ message: 'El ID del curso es requerido' })
  idCurso!: number;

  @IsString({ message: 'El ID del grupo de Telegram debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del grupo de Telegram es requerido' })
  telegramGroupId!: string;

  @IsString({ message: 'El nombre del grupo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del grupo es requerido' })
  nombreGrupo!: string;

  @IsString({ message: 'El enlace de invitación debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El enlace de invitación es requerido' })
  @IsUrl({}, { message: 'El enlace de invitación debe ser una URL válida' })
  enlaceInvitacion!: string;

  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  activo?: boolean;
}

export class UpdateGrupoTelegramDto {
  @IsString({ message: 'El ID del grupo de Telegram debe ser una cadena de texto' })
  @IsOptional()
  telegramGroupId?: string;

  @IsString({ message: 'El nombre del grupo debe ser una cadena de texto' })
  @IsOptional()
  nombreGrupo?: string;

  @IsString({ message: 'El enlace de invitación debe ser una cadena de texto' })
  @IsOptional()
  @IsUrl({}, { message: 'El enlace de invitación debe ser una URL válida' })
  enlaceInvitacion?: string;

  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  activo?: boolean;
}

export class GrupoTelegramResponseDto {
  idGrupoTelegram!: number;
  idCurso!: number;
  telegramGroupId!: string;
  nombreGrupo!: string;
  enlaceInvitacion!: string;
  fechaCreacion!: Date;
  fechaActualizacion!: Date;
  activo!: boolean;
}

export class GrupoTelegramWithCursoDto extends GrupoTelegramResponseDto {
  curso!: {
    idCurso: number;
    nombreCortoCurso: string;
    nombreCurso: string;
    modalidadCurso: string;
    fechaInicioCurso: Date;
    fechaFinCurso: Date;
  };
}
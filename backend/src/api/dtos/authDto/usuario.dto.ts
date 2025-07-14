import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;

  @IsString({ message: 'Los nombres deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  nombres!: string;

  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  apellidos!: string;

  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @IsOptional()
  activo?: boolean;

  @IsOptional()
  roleIds?: number[];
}

export class UpdateUsuarioDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsOptional()
  password?: string;

  @IsString({ message: 'Los nombres deben ser una cadena de texto' })
  @IsOptional()
  nombres?: string;

  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @IsOptional()
  apellidos?: string;

  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @IsOptional()
  activo?: boolean;

  @IsOptional()
  roleIds?: number[];
}

export class UsuarioDetailResponseDto {
  idUsuario!: number;
  email!: string;
  nombres!: string;
  apellidos!: string;
  activo!: boolean;
  fechaCreacion!: Date;
  fechaActualizacion!: Date;
  ultimoAcceso?: Date | null;
  roles!: {
    idRol: number;
    nombreRol: string;
    descripcionRol: string;
    fechaAsignacion: Date;
    activo: boolean;
  }[];
}

import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;
}

export class RefreshTokenDto {
  @IsString({ message: 'El refresh token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  refreshToken!: string;
}

export class UsuarioResponseDto {
  idUsuario!: number;
  email!: string;
  nombres!: string;
  apellidos!: string;
  activo!: boolean;
  roles!: string[];
  ultimoAcceso?: Date | null;
}

export class LoginResponseDto {
  user!: UsuarioResponseDto;
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: string;
}

export class RefreshResponseDto {
  accessToken!: string;
  expiresIn!: string;
}

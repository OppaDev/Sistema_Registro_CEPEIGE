import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Matches,
} from "class-validator";
import { IsCiPasaporte } from "@/utils/validators/ciPasaporte.validator";

export class CreateDatosPersonalesDto {  @IsString()
  @IsNotEmpty({ message: "CI o Pasaporte es requerido" })
  @IsCiPasaporte({ 
    message: "Debe ingresar una cédula ecuatoriana válida (10 dígitos) o un pasaporte válido (6-9 caracteres alfanuméricos en mayúsculas)" 
  })
  ciPasaporte!: string;

  @IsString()
  @IsNotEmpty({ message: "Los nombres son requeridos" })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "Los nombres solo pueden contener letras y espacios",
  })
  nombres!: string;

  @IsString()
  @IsNotEmpty({ message: "Los apellidos son requeridos" })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "Los apellidos solo pueden contener letras y espacios",
  })
  apellidos!: string;

  @IsString()
  @IsNotEmpty({ message: "El número de telefono es requerido" })
  @Matches(/^(\+\d{1,4})?[\s\-]?(\(?\d{1,4}\)?[\s\-]?)?\d{3,4}[\s\-]?\d{3,4}$/, {
    message: "El formato del teléfono no es válido. Formatos aceptados: +1234567890, +1 234 567 890, (123) 456-7890, 123-456-7890",
  })
  numTelefono!: string;

  @IsEmail({}, { message: "El formato del correo electrónico no es válido" })
  @IsNotEmpty({ message: "El correo es requerido" })
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: "El pais es requerido" })
  pais!: string;

  @IsString()
  @IsNotEmpty({ message: "La provincia o estado es requerido" })
  provinciaEstado!: string;

  @IsString()
  @IsNotEmpty({ message: "La ciudad es requerida" })
  ciudad!: string;

  @IsString()
  @IsNotEmpty({ message: "La profesion es requerida" })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "La profesion solo puede contener letras y espacios",
  })
  profesion!: string;

  @IsString()
  @IsNotEmpty({ message: "La institución es requerida" })
  institucion!: string;
}

// DTO de respuesta para exponer solo los campos deseados
export class DatosPersonalesResponseDto {
  idPersona!: number;
  ciPasaporte!: string;
  nombres!: string;
  apellidos!: string;
  numTelefono!: string;
  correo!: string;
  pais!: string;
  provinciaEstado!: string;
  ciudad!: string;
  profesion!: string;
  institucion!: string;
}

//dto para actualizar datos personales
export class UpdateDatosPersonalesDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "Los nombres solo pueden contener letras y espacios",
  })
  nombres?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "Los apellidos solo pueden contener letras y espacios",
  })
  apellidos?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(\+\d{1,4})?[\s\-]?(\(?\d{1,4}\)?[\s\-]?)?\d{3,4}[\s\-]?\d{3,4}$/, {
    message: "El formato del teléfono no es válido. Formatos aceptados: +1234567890, +1 234 567 890, (123) 456-7890, 123-456-7890",
  })
  numTelefono?: string;

  @IsEmail({}, { message: "El formato del correo electrónico no es válido" })
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  pais?: string;

  @IsString()
  @IsOptional()
  provinciaEstado?: string;

  @IsString()
  @IsOptional()
  ciudad?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "La profesion solo puede contener letras y espacios",
  })
  profesion?: string;

  @IsString()
  @IsOptional()
  institucion?: string;
}

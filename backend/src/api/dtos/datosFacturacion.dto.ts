import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsEmail,
} from "class-validator";

export class CreateDatosFacturacionDto {
  @IsString()
  @IsNotEmpty({ message: "La razón social es requerida" })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\&0-9]+$/, {
    message:
      "La razón social solo puede contener letras, números, espacios y algunos caracteres especiales permitidos (- . &)",
  })
  razonSocial!: string;

  @IsString()
  @IsNotEmpty({ message: "La identificación tributaria es requerida" })
  identificacionTributaria!: string;

  @IsString()
  @IsNotEmpty({ message: "El teléfono es requerido" })
  telefono!: string;

  @IsEmail({}, { message: "El formato del correo electrónico no es válido" })
  @IsNotEmpty({ message: "El correo de facturación es requerido" })
  correoFactura!: string;

  @IsString()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\&0-9]+$/, {
    message:
      "La dirección solo puede contener letras, números, espacios y algunos caracteres especiales permitidos (- . &)",
  })
  @IsNotEmpty({ message: "La dirección es requerida" })
  direccion!: string;
}

export class UpdateDatosFacturacionDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\&0-9]+$/, {
    message:
      "La razón social solo puede contener letras, números, espacios y algunos caracteres especiales permitidos (- . &)",
  })
  razonSocial?: string;

  @IsString()
  @IsOptional()
  identificacionTributaria?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail({}, { message: "El formato del correo electrónico no es válido" })
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\&0-9]+$/, {
    message:
      "La razón social solo puede contener letras, números, espacios y algunos caracteres especiales permitidos (- . &)",
  })
  correoFactura?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\&0-9]+$/, {
    message:
      "La dirección solo puede contener letras, números, espacios y algunos caracteres especiales permitidos (- . &)",
  })
  direccion?: string;
}

export class DatosFacturacionResponseDto {
  idFacturacion!: number;
  razonSocial!: string;
  identificacionTributaria!: string;
  telefono!: string;
  correoFactura!: string;
  direccion!: string;
}

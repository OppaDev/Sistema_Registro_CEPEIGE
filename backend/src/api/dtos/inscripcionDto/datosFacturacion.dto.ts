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
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-.&0-9]+$/, {
    message:
      "La razón social solo puede contener letras, números, espacios y algunos caracteres especiales permitidos (- . &)",
  })
  razonSocial!: string;

  @IsString()
  @IsNotEmpty({ message: "La identificación tributaria es requerida" })
  identificacionTributaria!: string;

  @IsString()
  @IsNotEmpty({ message: "El teléfono es requerido" })
  @Matches(/^(\+\d{1,4})?[\s-]?(\(?\d{1,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}$/, {
    message: "El formato del teléfono no es válido. Formatos aceptados: +1234567890, +1 234 567 890, (123) 456-7890, 123-456-7890",
  })
  telefono!: string;

  @IsEmail({}, { message: "El formato del correo electrónico no es válido" })
  @IsNotEmpty({ message: "El correo de facturación es requerido" })
  correoFactura!: string;

  @IsString()
  @IsNotEmpty({ message: "La dirección es requerida" })
  direccion!: string;
}

export class UpdateDatosFacturacionDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-.&0-9]+$/, {
    message:
      "La razón social solo puede contener letras, números, espacios y algunos caracteres especiales permitidos (- . &)",
  })
  razonSocial?: string;

  @IsString()
  @IsOptional()
  identificacionTributaria?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(\+\d{1,4})?[\s-]?(\(?\d{1,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}$/, {
    message: "El formato del teléfono no es válido. Formatos aceptados: +1234567890, +1 234 567 890, (123) 456-7890, 123-456-7890",
  })
  telefono?: string;

  @IsEmail({}, { message: "El formato del correo electrónico no es válido" })
  @IsOptional()
  correoFactura?: string;

  @IsString()
  @IsOptional()
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

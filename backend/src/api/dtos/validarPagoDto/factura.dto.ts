import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    IsBoolean,
    IsDecimal,
    Length,
    Matches,
} from "class-validator";
import { Type } from "class-transformer";
import { Decimal } from "@prisma/client/runtime/library";

export class CreateFacturaDto {
    @IsNotEmpty({ message: "El ID de la inscripción es obligatorio" })
    @IsNumber({}, { message: "El ID de la inscripción debe ser un número" })
    idInscripcion!: number;

    @IsNotEmpty({ message: "El ID de facturación es obligatorio" })
    @IsNumber({}, { message: "El ID de facturación debe ser un número" })
    idFacturacion!: number;

    @IsNotEmpty({ message: "El valor pagado es obligatorio" })
    @Type(() => Decimal)
    @IsDecimal({ decimal_digits: '2' }, { message: "El valor pagado debe ser un número decimal con máximo 2 decimales" })
    valorPagado!: Decimal;

    @IsNotEmpty({ message: "El número de ingreso es obligatorio" })
    @IsString({ message: "El número de ingreso debe ser una cadena de texto" })
    @Length(1, 100, { message: "El número de ingreso debe tener entre 1 y 100 caracteres" })
    numeroIngreso!: string;

    @IsNotEmpty({ message: "El número de factura es obligatorio" })
    @IsString({ message: "El número de factura debe ser una cadena de texto" })
    @Length(1, 100, { message: "El número de factura debe tener entre 1 y 100 caracteres" })
    @Matches(/^[A-Z0-9\-]+$/, { message: "El número de factura solo puede contener letras mayúsculas, números y guiones" })
    numeroFactura!: string;
}

export class UpdateFacturaDto {
    @IsOptional()
    @IsBoolean({ message: "La verificación de pago debe ser verdadero o falso" })
    verificacionPago?: boolean;
}

export class FacturaResponseDto {
    idFactura!: number;
    idInscripcion!: number;
    idFacturacion!: number;
    valorPagado!: Decimal;
    verificacionPago!: boolean;
    numeroIngreso!: string;
    numeroFactura!: string;
    
    // Relaciones opcionales para cuando se incluyan en las consultas
    inscripcion?: {
        idInscripcion: number;
        fechaInscripcion: Date;
        matricula: boolean;
        curso?: {
            idCurso: number;
            nombreCurso: string;
            nombreCortoCurso: string;
            modalidadCurso: string;
            valorCurso: Decimal;
        };
        persona?: {
            idPersona: number;
            nombres: string;
            apellidos: string;
            ciPasaporte: string;
            correo: string;
        };
    };
}

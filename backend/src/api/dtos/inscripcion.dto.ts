import {
    IsNumber,
    IsOptional,
    IsBoolean
} from "class-validator";

export class CreateInscripcionDto {
    @IsNumber({}, { message: "El ID del curso debe ser un número" })
    idCurso!: number;

    @IsNumber({}, { message: "El ID de la persona debe ser un número" })
    idPersona!: number;

    @IsNumber({}, { message: "El ID de la facturación debe ser un número" })
    idFacturacion!: number;

    @IsNumber({}, { message: "El ID del comprobante debe ser un número" })
    idComprobante!: number;
}

export class InscripcionResponseDto {
    estadoInscripcion!: string; 
}

export class UpdateInscripcionDto {
    @IsOptional()
    @IsNumber({}, { message: "El ID del descuento debe ser un número" })
    idDescuento?: number;

    
    @IsOptional()
    @IsBoolean({ message: "El estado de matrícula debe ser un booleano" })
    matricula?: boolean;
}
import {
    IsNumber,
    IsOptional,
    IsBoolean,
    IsNotEmpty
} from "class-validator";
import { CursoResponseDto } from "@/api/dtos/cursoDto/curso.dto";
import { DatosPersonalesResponseDto } from "@/api/dtos/inscripcionDto/datosPersonales.dto";
import { DatosFacturacionResponseDto } from "@/api/dtos/inscripcionDto/datosFacturacion.dto";
import { ComprobanteResponseDto } from "@/api/dtos/inscripcionDto/comprobante.dto";
import { DescuentoResponseDto } from "@/api/dtos/inscripcionDto/descuento.dto";

export class CreateInscripcionDto {
    @IsNotEmpty({ message: "El ID del curso es obligatorio" })
    @IsNumber({}, { message: "El ID del curso debe ser un número" })
    idCurso!: number;

    @IsNotEmpty({ message: "El ID de la persona es obligatorio" })
    @IsNumber({}, { message: "El ID de la persona debe ser un número" })
    idPersona!: number;

    @IsNotEmpty({ message: "El ID de la facturación es obligatorio" })
    @IsNumber({}, { message: "El ID de la facturación debe ser un número" })
    idFacturacion!: number;

    @IsNotEmpty({ message: "El ID del comprobante es obligatorio" })
    @IsNumber({}, { message: "El ID del comprobante debe ser un número" })
    idComprobante!: number;
}



export class UpdateInscripcionDto {
    @IsOptional()
    @IsNumber({}, { message: "El ID del descuento debe ser un número" })
    idDescuento?: number;

    @IsOptional()
    @IsBoolean({ message: "El estado de matrícula debe ser un booleano" })
    matricula?: boolean;
}

export class InscripcionResponseDto {
    idInscripcion!: number;
    curso!: CursoResponseDto;
    datosPersonales!: DatosPersonalesResponseDto;
    datosFacturacion!: DatosFacturacionResponseDto;
    comprobante!: ComprobanteResponseDto;
    fechaInscripcion!: Date;
}

export class InscripcionAdminResponseDto {
    idInscripcion!: number;
    curso!: CursoResponseDto;
    datosPersonales!: DatosPersonalesResponseDto;
    datosFacturacion!: DatosFacturacionResponseDto;
    descuento?: DescuentoResponseDto;
    comprobante!: ComprobanteResponseDto;
    matricula!: boolean;
    fechaInscripcion!: Date;
}
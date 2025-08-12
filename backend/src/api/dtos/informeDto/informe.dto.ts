import {
    IsOptional,
    IsDateString,
    IsNumber,
    IsBoolean,
    IsString,
    IsEnum
} from "class-validator";
import { Transform } from "class-transformer";

// Enum para tipos de informe
export enum TipoInforme {
    INSCRIPCIONES = 'inscripciones',
    PAGADOS = 'pagados',
    MATRICULADOS = 'matriculados',
    PENDIENTES = 'pendientes'
}

// Enum para formato de exportación
export enum FormatoExportacion {
    EXCEL = 'excel',
    PDF = 'pdf'
}

// DTO para filtros de informe
export class FiltrosInformeDto {
    @IsOptional()
    @IsDateString({}, { message: "La fecha de inicio debe ser una fecha válida" })
    fechaInicio?: string;

    @IsOptional()
    @IsDateString({}, { message: "La fecha de fin debe ser una fecha válida" })
    fechaFin?: string;

    @IsOptional()
    @Transform(({ value }) => value ? parseInt(value, 10) : value)
    @IsNumber({}, { message: "El ID del curso debe ser un número" })
    idCurso?: number;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean({ message: "El estado de matrícula debe ser un booleano" })
    matricula?: boolean;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean({ message: "El estado de verificación de pago debe ser un booleano" })
    verificacionPago?: boolean;

    @IsOptional()
    @IsString({ message: "El nombre del curso debe ser una cadena de texto" })
    nombreCurso?: string;
}

// DTO para parámetros de generación de informe
export class GenerarInformeDto extends FiltrosInformeDto {
    @IsEnum(TipoInforme, { message: "El tipo de informe debe ser válido" })
    tipoInforme!: TipoInforme;

    @IsEnum(FormatoExportacion, { message: "El formato debe ser 'excel' o 'pdf'" })
    formato!: FormatoExportacion;
}

// DTO para respuesta de datos de inscripción en informe
export class InscripcionInformeDto {
    idInscripcion!: number;
    nombreCompleto!: string;
    email!: string;
    telefono!: string;
    cedula!: string;
    nombreCurso!: string;
    fechaInscripcion!: Date;
    matricula!: boolean;
    tipoComprobante!: string;
    montoComprobante!: number;
    verificacionPago!: boolean;
    montoTotal?: number;
    descuento!: string;
    porcentajeDescuento!: number;
    fechaVencimiento!: Date;
    estadoPago!: string;
}

// DTO para estadísticas del informe
export class EstadisticasInformeDto {
    totalInscripciones!: number;
    matriculados!: number;
    noMatriculados!: number;
    pagosVerificados!: number;
    pagosPendientes!: number;
    montoTotalComprobantes!: number;
    promedioMonto!: number;
    cursosUnicos!: number;
    tiposComprobante!: Record<string, number>;
    inscripcionesPorCurso!: Record<string, number>;
}

// DTO para respuesta de informe completo
export class InformeCompletoDto {
    estadisticas!: EstadisticasInformeDto;
    inscripciones!: InscripcionInformeDto[];
    filtrosAplicados!: FiltrosInformeDto;
    fechaGeneracion!: Date;
    totalRegistros!: number;
}

// DTO para respuesta de archivo generado
export class ArchivoInformeDto {
    nombreArchivo!: string;
    tipoArchivo!: string;
    tamanoBytes!: number;
    fechaGeneracion!: Date;
    filtrosAplicados!: FiltrosInformeDto;
}
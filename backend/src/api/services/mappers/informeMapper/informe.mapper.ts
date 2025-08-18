import { 
    InscripcionInformeDto, 
    EstadisticasInformeDto, 
    InformeCompletoDto,
    FiltrosInformeDto,
    ArchivoInformeDto
} from "@/api/dtos/informeDto/informe.dto";

// Tipo para datos de Prisma con todas las relaciones necesarias
export type PrismaInscripcionInforme = {
    idInscripcion: number;
    fechaInscripcion: Date;
    matricula: boolean;
    persona: {
        nombres: string;
        apellidos: string;
        correo: string;
        numTelefono: string;
        ciPasaporte: string;
    };
    curso: {
        nombreCurso: string;
        fechaFinCurso?: Date;
    };
    comprobante: {
        tipoArchivo: string;
        nombreArchivo: string;
    };
    descuento?: {
        tipoDescuento: string;
        porcentajeDescuento: number;
    } | null;
    facturas: {
        valorPagado: number;
        verificacionPago: boolean;
    }[];
};

/**
 * Mapear datos de Prisma a DTO de inscripción para informe
 */
export function toInscripcionInformeDto(prismaData: PrismaInscripcionInforme): InscripcionInformeDto {
    const tieneFacturas = prismaData.facturas.length > 0;
    const pagoVerificado = tieneFacturas ? prismaData.facturas.some(f => f.verificacionPago) : false;
    
    // Determinar estado de pago
    let estadoPago = 'Pendiente';
    if (pagoVerificado) {
        estadoPago = 'Verificado';
    } else if (tieneFacturas) {
        estadoPago = 'En revisión';
    }

    return {
        idInscripcion: prismaData.idInscripcion,
        nombreCompleto: `${prismaData.persona.nombres} ${prismaData.persona.apellidos}`,
        email: prismaData.persona.correo,
        telefono: prismaData.persona.numTelefono,
        cedula: prismaData.persona.ciPasaporte,
        nombreCurso: prismaData.curso.nombreCurso,
        fechaInscripcion: prismaData.fechaInscripcion,
        matricula: prismaData.matricula,
        tipoComprobante: prismaData.comprobante.tipoArchivo,
        montoComprobante: tieneFacturas ? Number(prismaData.facturas[0].valorPagado) || 0 : 0,
        verificacionPago: pagoVerificado,
        montoTotal: tieneFacturas ? Number(prismaData.facturas[0].valorPagado) || 0 : 0,
        descuento: prismaData.descuento 
            ? `${prismaData.descuento.tipoDescuento} (${prismaData.descuento.porcentajeDescuento}%)`
            : '',
        porcentajeDescuento: prismaData.descuento?.porcentajeDescuento || 0,
        fechaVencimiento: prismaData.curso.fechaFinCurso || new Date(),
        estadoPago: estadoPago
    };
}

/**
 * Mapear array de datos de Prisma a array de DTOs
 */
export function toInscripcionInformeDtoArray(prismaDataArray: PrismaInscripcionInforme[]): InscripcionInformeDto[] {
    return prismaDataArray.map(data => toInscripcionInformeDto(data));
}

/**
 * Generar estadísticas a partir de array de inscripciones
 */
export function toEstadisticasInformeDto(inscripciones: InscripcionInformeDto[]): EstadisticasInformeDto {
    const total = inscripciones.length;
    const matriculados = inscripciones.filter(i => i.matricula).length;
    const pagosVerificados = inscripciones.filter(i => i.verificacionPago).length;
    const montoTotal = inscripciones.reduce((sum, i) => sum + (Number(i.montoComprobante) || 0), 0);

    // Agrupar por tipo de comprobante
    const tiposComprobante = inscripciones.reduce((acc: Record<string, number>, inscripcion) => {
        acc[inscripcion.tipoComprobante] = (acc[inscripcion.tipoComprobante] || 0) + 1;
        return acc;
    }, {});

    // Agrupar por curso
    const inscripcionesPorCurso = inscripciones.reduce((acc: Record<string, number>, inscripcion) => {
        acc[inscripcion.nombreCurso] = (acc[inscripcion.nombreCurso] || 0) + 1;
        return acc;
    }, {});

    return {
        totalInscripciones: total,
        matriculados: matriculados,
        noMatriculados: total - matriculados,
        pagosVerificados: pagosVerificados,
        pagosPendientes: total - pagosVerificados,
        montoTotalComprobantes: montoTotal,
        promedioMonto: total > 0 ? montoTotal / total : 0,
        cursosUnicos: [...new Set(inscripciones.map(i => i.nombreCurso))].length,
        tiposComprobante: tiposComprobante,
        inscripcionesPorCurso: inscripcionesPorCurso
    };
}

/**
 * Crear informe completo combinando datos y estadísticas
 */
export function toInformeCompletoDto(
    inscripciones: InscripcionInformeDto[],
    filtros: FiltrosInformeDto
): InformeCompletoDto {
    const estadisticas = toEstadisticasInformeDto(inscripciones);

    return {
        estadisticas: estadisticas,
        inscripciones: inscripciones,
        filtrosAplicados: filtros,
        fechaGeneracion: new Date(),
        totalRegistros: inscripciones.length
    };
}

/**
 * Crear DTO para archivo generado
 */
export function toArchivoInformeDto(
    nombreArchivo: string,
    tipoArchivo: string,
    buffer: Buffer,
    filtros: FiltrosInformeDto
): ArchivoInformeDto {
    return {
        nombreArchivo: nombreArchivo,
        tipoArchivo: tipoArchivo,
        tamanoBytes: buffer.length,
        fechaGeneracion: new Date(),
        filtrosAplicados: filtros
    };
}

/**
 * Generar nombre de archivo basado en filtros y formato
 */
export function generarNombreArchivo(
    tipoInforme: string,
    formato: 'excel' | 'pdf',
    filtros: FiltrosInformeDto
): string {
    const fecha = new Date().toISOString().split('T')[0];
    let nombreBase = `informe_${tipoInforme}_${fecha}`;

    // Agregar filtros al nombre si existen
    if (filtros.idCurso) {
        nombreBase += `_curso${filtros.idCurso}`;
    }
    if (filtros.matricula !== undefined) {
        nombreBase += `_${filtros.matricula ? 'matriculados' : 'no_matriculados'}`;
    }
    if (filtros.verificacionPago !== undefined) {
        nombreBase += `_${filtros.verificacionPago ? 'pagados' : 'pendientes'}`;
    }

    const extension = formato === 'excel' ? 'xlsx' : 'pdf';
    return `${nombreBase}.${extension}`;
}

/**
 * Mapear string de filtros de fecha a Date
 */
export function mapearFiltrosFecha(filtros: FiltrosInformeDto) {
    const resultado: {
        fechaInicio?: Date;
        fechaFin?: Date;
        idCurso?: number;
        matricula?: boolean;
        verificacionPago?: boolean;
    } = {};

    if (filtros.fechaInicio) {
        resultado.fechaInicio = new Date(filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
        resultado.fechaFin = new Date(filtros.fechaFin);
    }
    if (filtros.idCurso !== undefined) {
        resultado.idCurso = filtros.idCurso;
    }
    if (filtros.matricula !== undefined) {
        resultado.matricula = filtros.matricula;
    }
    if (filtros.verificacionPago !== undefined) {
        resultado.verificacionPago = filtros.verificacionPago;
    }

    return resultado;
}
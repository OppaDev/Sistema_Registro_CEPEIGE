// models/informe/informe.ts

export enum TipoInforme {
  INSCRIPCIONES = 'inscripciones',
  PAGADOS = 'pagados',
  MATRICULADOS = 'matriculados',
  PENDIENTES = 'pendientes'
}

export enum FormatoExportacion {
  EXCEL = 'excel',
  PDF = 'pdf'
}

export interface FiltrosInforme {
  fechaInicio?: string;
  fechaFin?: string;
  idCurso?: number;
  matricula?: boolean;
  verificacionPago?: boolean;
}

export interface GenerarInformeData {
  tipoInforme: TipoInforme;
  formato: FormatoExportacion;
  fechaInicio?: string;
  fechaFin?: string;
  idCurso?: number;
  matricula?: boolean;
  verificacionPago?: boolean;
}

export interface InscripcionInforme {
  idInscripcion: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  cedula: string;
  nombreCurso: string;
  fechaInscripcion: Date;
  matricula: boolean;
  tipoComprobante: string;
  montoComprobante: number;
  estadoPago: string;
  verificacionPago: boolean;
  montoTotal?: number;
  descuento?: string;
}

export interface EstadisticasInforme {
  totalInscripciones: number;
  estudiantesMatriculados: number;
  pagosVerificados: number;
  pagosPendientes: number;
  montoTotalRecaudado: number;
  distribucionPorCurso: {
    nombreCurso: string;
    cantidad: number;
    porcentaje: number;
  }[];
  distribucionPorEstado: {
    estado: string;
    cantidad: number;
    porcentaje: number;
  }[];
}

export interface InformeCompleto {
  inscripciones: InscripcionInforme[];
  estadisticas: EstadisticasInforme;
  filtrosAplicados: FiltrosInforme;
  fechaGeneracion: Date;
  totalRegistros: number;
}

export interface ArchivoInforme {
  nombreArchivo: string;
  tipoArchivo: string;
  tamanoBytes: number;
  fechaGeneracion: Date;
  filtrosAplicados: FiltrosInforme;
}

export interface CursoDisponible {
  idCurso: number;
  nombreCurso: string;
}

export interface TipoInformeConfig {
  valor: TipoInforme;
  etiqueta: string;
  descripcion: string;
}

export interface FormatoExportacionConfig {
  valor: FormatoExportacion;
  etiqueta: string;
  tipoMime: string;
}

export interface ConfiguracionInformes {
  tiposInforme: TipoInformeConfig[];
  formatosExportacion: FormatoExportacionConfig[];
}

export interface InformeApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}
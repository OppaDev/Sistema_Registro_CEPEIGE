// models/validarPago/factura.ts
export interface CreateFacturaData {
  idInscripcion: number;
  idFacturacion: number;
  valorPagado: number;
  numeroIngreso: string;
  numeroFactura: string;
}

export interface UpdateFacturaData {
  verificacionPago?: boolean;
}

export interface FacturaData {
  idFactura: number;
  idInscripcion: number;
  idFacturacion: number;
  valorPagado: number;
  verificacionPago: boolean;
  numeroIngreso: string;
  numeroFactura: string;
  inscripcion?: {
    idInscripcion: number;
    fechaInscripcion: Date;
    matricula: boolean;
    curso?: {
      idCurso: number;
      nombreCurso: string;
      nombreCortoCurso: string;
      modalidadCurso: string;
      valorCurso: number;
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

export interface FacturaResponse {
  success: boolean;
  data: FacturaData | FacturaData[];
  message: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
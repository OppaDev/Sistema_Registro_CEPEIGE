// models/validarPago/factura.ts
export interface Factura {
  idFactura: number;
  idInscripcion: number;
  idFacturacion: number;
  valorPagado: number;
  verificacionPago: boolean;
  numeroIngreso: string;
  numeroFactura: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface CreateFacturaRequest {
  idInscripcion: number;
  idFacturacion: number;
  valorPagado: number;
  numeroIngreso: string;
  numeroFactura: string;
}

export interface UpdateFacturaRequest {
  valorPagado?: number;
  numeroIngreso?: string;
  numeroFactura?: string;
  verificacionPago?: boolean;
}

export interface FacturaResponse {
  success: boolean;
  data: Factura;
  message: string;
}

export interface FacturaListResponse {
  success: boolean;
  data: Factura[];
  message: string;
}

// Estados de verificación
export type EstadoVerificacion = 'PENDIENTE' | 'VERIFICADO';

// Helper para determinar el estado
export const getEstadoVerificacion = (verificacionPago: boolean): EstadoVerificacion => {
  return verificacionPago ? 'VERIFICADO' : 'PENDIENTE';
};

// Validaciones
export const validateFacturaData = (data: CreateFacturaRequest): string[] => {
  const errors: string[] = [];

  if (!data.idInscripcion || data.idInscripcion <= 0) {
    errors.push('ID de inscripción es requerido');
  }

  if (!data.idFacturacion || data.idFacturacion <= 0) {
    errors.push('ID de facturación es requerido');
  }

  if (!data.valorPagado || data.valorPagado <= 0) {
    errors.push('Valor pagado debe ser mayor a 0');
  }

  if (!data.numeroIngreso || data.numeroIngreso.trim() === '') {
    errors.push('Número de ingreso es requerido');
  }

  if (!data.numeroFactura || data.numeroFactura.trim() === '') {
    errors.push('Número de factura es requerido');
  }

  return errors;
};
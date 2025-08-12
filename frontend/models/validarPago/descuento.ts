// models/validarPago/descuento.ts
export interface Descuento {
  idDescuento: number;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  porcentajeDescuento: number;
  descripcion: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export type TipoDescuento = 'INDIVIDUAL' | 'GRUPAL' | 'INSTITUCIONAL' | 'PROMOCIONAL';

export interface CreateDescuentoRequest {
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  porcentajeDescuento: number;
  descripcion: string;
}

export interface UpdateDescuentoRequest {
  tipoDescuento?: TipoDescuento;
  valorDescuento?: number;
  porcentajeDescuento?: number;
  descripcion?: string;
}

export interface DescuentoResponse {
  success: boolean;
  data: Descuento;
  message: string;
}

export interface DescuentoListResponse {
  success: boolean;
  data: Descuento[];
  message: string;
}

// Información de descuento para inscripciones
export interface DescuentoInscripcion {
  numeroEstudiantes: number;
  cantidadDescuento: number;
  tipoDescuento: TipoDescuento;
  descripcion?: string;
}

// Validaciones
export const validateDescuentoData = (data: CreateDescuentoRequest): string[] => {
  const errors: string[] = [];

  if (!data.tipoDescuento) {
    errors.push('Tipo de descuento es requerido');
  }

  if (data.valorDescuento < 0) {
    errors.push('Valor de descuento no puede ser negativo');
  }

  if (data.porcentajeDescuento < 0 || data.porcentajeDescuento > 100) {
    errors.push('Porcentaje de descuento debe estar entre 0 y 100');
  }

  if (data.valorDescuento === 0 && data.porcentajeDescuento === 0) {
    errors.push('Debe especificar un valor o porcentaje de descuento');
  }

  if (!data.descripcion || data.descripcion.trim() === '') {
    errors.push('Descripción es requerida');
  }

  return errors;
};

// Helper para calcular descuento
export const calcularDescuento = (
  montoBase: number, 
  descuento: Descuento
): number => {
  if (descuento.valorDescuento > 0) {
    return Math.min(descuento.valorDescuento, montoBase);
  }
  
  if (descuento.porcentajeDescuento > 0) {
    return (montoBase * descuento.porcentajeDescuento) / 100;
  }
  
  return 0;
};

// Helper para formatear tipo de descuento
export const formatTipoDescuento = (tipo: TipoDescuento): string => {
  const tipos = {
    'INDIVIDUAL': 'Individual',
    'GRUPAL': 'Grupal',
    'INSTITUCIONAL': 'Institucional',
    'PROMOCIONAL': 'Promocional'
  };
  
  return tipos[tipo] || tipo;
};
// models/validarPago/descuento.ts
export interface DescuentoData {
  idDescuento: number;
  tipoDescuento: string;
  valorDescuento: number;
  porcentajeDescuento: number;
  descripcionDescuento: string;
}

export interface CreateDescuentoData {
  tipoDescuento: string;
  valorDescuento: number;
  porcentajeDescuento: number;
  descripcionDescuento: string;
}

export interface UpdateDescuentoData {
  tipoDescuento?: string;
  valorDescuento?: number;
  porcentajeDescuento?: number;
  descripcionDescuento?: string;
}

export interface DescuentoResponse {
  success: boolean;
  data: DescuentoData | DescuentoData[];
  message: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Tipos específicos para descuentos
export type TipoDescuento = 'estudiante' | 'institucion' | 'promocional' | 'otro';

export interface DescuentoFormData {
  numeroEstudiantes?: number;
  cantidadDescuento?: number;
  porcentajeDescuento?: number;
  tipoDescuento: TipoDescuento;
  descripcion?: string;
}
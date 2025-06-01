export interface Descuento {
  idDescuento: number;
  tipoDescuento: string;
  valorDescuento: number;
  porcentajeDescuento: number;
  descripcionDescuento: string;
}

export enum TipoDescuento {
  ESTUDIANTE = 'ESTUDIANTE',
  PROFESIONAL = 'PROFESIONAL',
  INSTITUCIONAL = 'INSTITUCIONAL',
  PROMOCIONAL = 'PROMOCIONAL'
}
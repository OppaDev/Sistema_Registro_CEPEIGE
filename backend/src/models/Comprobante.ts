export interface Comprobante {
  idComprobante: number;
  idFactura: number;
  fechaSubida: Date;
  rutaComprobante: string;
  tipoArchivo: string;
  nombreArchivo: string;
}

export interface ComprobanteConFactura extends Comprobante {
  factura: Factura;
}

export enum TipoArchivo {
  PDF = 'PDF',
  JPG = 'JPG',
  JPEG = 'JPEG',
  PNG = 'PNG'
}
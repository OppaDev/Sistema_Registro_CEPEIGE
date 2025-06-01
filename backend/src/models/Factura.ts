import { Inscripcion } from './Inscripcion';
import { DatosFacturacion } from './DatosFacturacion';

export interface Factura {
  idFactura: number;
  idInscripcion: number;
  idFacturacion: number;
  valorPagado: number;
  verificacionPago: boolean;
  numeroIngreso: string;
  numeroFactura: string;
}

export interface FacturaCompleta extends Factura {
  inscripcion: Inscripcion;
  datosFacturacion: DatosFacturacion;
  comprobantes: Comprobante[];
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  VERIFICADO = 'VERIFICADO',
  RECHAZADO = 'RECHAZADO'
}
import { Curso } from './Curso';
import { DatosPersonales } from './DatosPersonales';
import { Descuento } from './Descuento';
import { DatosFacturacion } from './DatosFacturacion';

export interface Inscripcion {
  idInscripcion: number;
  idCurso: number;
  idPersona: number;
  idDescuento?: number | null;
  idFacturacion: number;
  matricula: boolean;
  fechaInscripcion: Date;
}

export interface InscripcionCompleta extends Inscripcion {
  curso: Curso;
  persona: DatosPersonales;
  descuento?: Descuento | null;
  datosFacturacion: DatosFacturacion;
  valorFinal: number; // Computed property
}

export enum EstadoInscripcion {
  PENDIENTE = 'PENDIENTE',
  MATRICULADO = 'MATRICULADO',
  CANCELADO = 'CANCELADO'
}
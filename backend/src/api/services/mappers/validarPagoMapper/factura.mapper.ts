import {
  Factura as PrismaFactura,
  Inscripcion as PrismaInscripcion,
  Curso as PrismaCurso,
  DatosPersonales as PrismaDatosPersonales,
  DatosFacturacion as PrismaDatosFacturacion,
} from "@prisma/client";
import { FacturaResponseDto } from "@/api/dtos/validarPagoDto/factura.dto";

// Tipo para Factura básica sin relaciones
export const toFacturaResponseDto = (factura: PrismaFactura): FacturaResponseDto => {
  return {
    idFactura: factura.idFactura,
    idInscripcion: factura.idInscripcion,
    idFacturacion: factura.idFacturacion,
    valorPagado: factura.valorPagado,
    verificacionPago: factura.verificacionPago,
    numeroIngreso: factura.numeroIngreso,
    numeroFactura: factura.numeroFactura,
  };
};

// Tipo para Factura con relaciones completas
export type PrismaFacturaConRelaciones = PrismaFactura & {
  inscripcion: PrismaInscripcion & {
    curso: PrismaCurso;
    persona: PrismaDatosPersonales;
  };
  datosFacturacion?: PrismaDatosFacturacion;
};

// Mapper para Factura con relaciones incluidas
export const toFacturaWithRelationsResponseDto = (
  factura: PrismaFacturaConRelaciones
): FacturaResponseDto => {
  return {
    idFactura: factura.idFactura,
    idInscripcion: factura.idInscripcion,
    idFacturacion: factura.idFacturacion,
    valorPagado: factura.valorPagado,
    verificacionPago: factura.verificacionPago,
    numeroIngreso: factura.numeroIngreso,
    numeroFactura: factura.numeroFactura,
    inscripcion: {
      idInscripcion: factura.inscripcion.idInscripcion,
      fechaInscripcion: factura.inscripcion.fechaInscripcion,
      matricula: factura.inscripcion.matricula,
      curso: {
        idCurso: factura.inscripcion.curso.idCurso,
        nombreCurso: factura.inscripcion.curso.nombreCurso,
        nombreCortoCurso: factura.inscripcion.curso.nombreCortoCurso,
        modalidadCurso: factura.inscripcion.curso.modalidadCurso,
        valorCurso: factura.inscripcion.curso.valorCurso,
      },
      persona: {
        idPersona: factura.inscripcion.persona.idPersona,
        nombres: factura.inscripcion.persona.nombres,
        apellidos: factura.inscripcion.persona.apellidos,
        ciPasaporte: factura.inscripcion.persona.ciPasaporte,
        correo: factura.inscripcion.persona.correo,
      },
    },
  };
};
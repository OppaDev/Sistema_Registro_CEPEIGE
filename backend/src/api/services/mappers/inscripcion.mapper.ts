import {
  Inscripcion as PrismaInscripcion,
  Curso as PrismaCurso,
  DatosPersonales as PrismaDatosPersonales,
  DatosFacturacion as PrismaDatosFacturacion,
  Comprobante as PrismaComprobante,
} from "@prisma/client";
import { InscripcionResponseDto } from "@/api/dtos/inscripcion.dto";

type PrismaInscripcionConRelaciones = PrismaInscripcion & {
  curso: PrismaCurso;
  persona: PrismaDatosPersonales;
  datosFacturacion: PrismaDatosFacturacion;
  comprobante: PrismaComprobante;
};

export const toInscripcionResponseDto = (inscripcion: PrismaInscripcionConRelaciones): InscripcionResponseDto => {
  return {
    idInscripcion: inscripcion.idInscripcion,
    fechaInscripcion: inscripcion.fechaInscripcion,
    curso: { 
      idCurso: inscripcion.curso.idCurso,
      nombreCurso: inscripcion.curso.nombreCurso,
      nombreCortoCurso: inscripcion.curso.nombreCortoCurso,
      descripcionCurso: inscripcion.curso.descripcionCurso,
      valorCurso: inscripcion.curso.valorCurso,
      fechaInicioCurso: inscripcion.curso.fechaInicioCurso,
      fechaFinCurso: inscripcion.curso.fechaFinCurso,
    },
    datosPersonales: { 
      idPersona: inscripcion.persona.idPersona,
      ciPasaporte: inscripcion.persona.ciPasaporte,
      nombres: inscripcion.persona.nombres,
      apellidos: inscripcion.persona.apellidos,
      correo: inscripcion.persona.correo,
      numTelefono: inscripcion.persona.numTelefono,
      pais: inscripcion.persona.pais,
      provinciaEstado: inscripcion.persona.provinciaEstado,
      ciudad: inscripcion.persona.ciudad,
      profesion: inscripcion.persona.profesion,
      institucion: inscripcion.persona.institucion,
    },
    datosFacturacion: { 
      idFacturacion: inscripcion.datosFacturacion.idFacturacion,
      razonSocial: inscripcion.datosFacturacion.razonSocial,
      identificacionTributaria: inscripcion.datosFacturacion.identificacionTributaria,
      telefono: inscripcion.datosFacturacion.telefono,
      correoFactura: inscripcion.datosFacturacion.correoFactura,
      direccion: inscripcion.datosFacturacion.direccion,
    },
    comprobante: { 
      idComprobante: inscripcion.comprobante.idComprobante,
      fechaSubida: inscripcion.comprobante.fechaSubida,
      nombreArchivo: inscripcion.comprobante.nombreArchivo,
      rutaComprobante: inscripcion.comprobante.rutaComprobante,
      tipoArchivo: inscripcion.comprobante.tipoArchivo,
    },
  };
};

export type { PrismaInscripcionConRelaciones };

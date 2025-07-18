import {
  Inscripcion as PrismaInscripcion,
  Curso as PrismaCurso,
  DatosPersonales as PrismaDatosPersonales,
  DatosFacturacion as PrismaDatosFacturacion,
  Comprobante as PrismaComprobante,
  Descuento as PrismaDescuento,
} from "@prisma/client";
import {
  InscripcionResponseDto,
  InscripcionAdminResponseDto,
} from "@/api/dtos/inscripcionDto/inscripcion.dto";
import { toCursoResponseDto } from "@/api/services/mappers/cursoMapper/curso.mapper";
import { toDatosPersonalesResponseDto } from "@/api/services/mappers/inscripcionMapper/datosPersonales.mapper";
import { toDatosFacturacionResponseDto } from "@/api/services/mappers/inscripcionMapper/datosFacturacion.mapper";
import { toComprobanteResponseDto } from "@/api/services/mappers/inscripcionMapper/comprobante.mapper";
import { toDescuentoResponseDto } from "@/api/services/mappers/validarPagoMapper/descuento.mapper";

//para IncripcionResponseDto
export type PrismaInscripcionConRelaciones = PrismaInscripcion & {
  curso: PrismaCurso;
  persona: PrismaDatosPersonales;
  datosFacturacion: PrismaDatosFacturacion;
  comprobante: PrismaComprobante;
};

export const toInscripcionResponseDto = (
  inscripcion: PrismaInscripcionConRelaciones
): InscripcionResponseDto => {
  return {
    idInscripcion: inscripcion.idInscripcion,
    fechaInscripcion: inscripcion.fechaInscripcion,
    curso: toCursoResponseDto(inscripcion.curso),
    datosPersonales: toDatosPersonalesResponseDto(inscripcion.persona),
    datosFacturacion: toDatosFacturacionResponseDto(inscripcion.datosFacturacion),
    comprobante: toComprobanteResponseDto(inscripcion.comprobante),
  };
};

// para InscripcionAdminResponseDto
export type PrismaInscripcionAdminConRelaciones = PrismaInscripcion & {
  curso: PrismaCurso;
  persona: PrismaDatosPersonales;
  datosFacturacion: PrismaDatosFacturacion;
  comprobante: PrismaComprobante;
  descuento?: PrismaDescuento | null;
};

export const toInscripcionAdminResponseDto = (
  inscripcion: PrismaInscripcionAdminConRelaciones
): InscripcionAdminResponseDto => {
  return {
    idInscripcion: inscripcion.idInscripcion,
    fechaInscripcion: inscripcion.fechaInscripcion,
    curso: toCursoResponseDto(inscripcion.curso),
    datosPersonales: toDatosPersonalesResponseDto(inscripcion.persona),
    datosFacturacion: toDatosFacturacionResponseDto(inscripcion.datosFacturacion),
    comprobante: toComprobanteResponseDto(inscripcion.comprobante),
    matricula: inscripcion.matricula,
    ...(inscripcion.descuento && { descuento: toDescuentoResponseDto(inscripcion.descuento) }),
  };
};
import { Comprobante as PrismaComprobante } from "@prisma/client";
import { ComprobanteResponseDto } from "@/api/dtos/comprobante.dto";

export const toComprobanteResponseDto = (comprobante: PrismaComprobante): ComprobanteResponseDto => {
  return {
    idComprobante: comprobante.idComprobante,
    fechaSubida: comprobante.fechaSubida,
    rutaComprobante: comprobante.rutaComprobante,
    tipoArchivo: comprobante.tipoArchivo,
    nombreArchivo: comprobante.nombreArchivo,
  };
};

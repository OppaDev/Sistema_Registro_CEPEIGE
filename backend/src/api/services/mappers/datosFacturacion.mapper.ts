import { DatosFacturacion as PrismaDatosFacturacion } from "@prisma/client";
import { DatosFacturacionResponseDto } from "@/api/dtos/datosFacturacion.dto";

export const toDatosFacturacionResponseDto = (datos: PrismaDatosFacturacion): DatosFacturacionResponseDto => {
  return {
    idFacturacion: datos.idFacturacion,
    razonSocial: datos.razonSocial,
    identificacionTributaria: datos.identificacionTributaria,
    telefono: datos.telefono,
    correoFactura: datos.correoFactura,
    direccion: datos.direccion,
  };
};

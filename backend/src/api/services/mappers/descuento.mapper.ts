import { Descuento as PrismaDescuento } from "@prisma/client";
import { DescuentoResponseDto } from "@/api/dtos/descuento.dto";

export const toDescuentoResponseDto = (
  descuento: PrismaDescuento
): DescuentoResponseDto => {
  return {
    idDescuento: descuento.idDescuento,
    tipoDescuento: descuento.tipoDescuento,
    valorDescuento: descuento.valorDescuento,
    porcentajeDescuento: descuento.porcentajeDescuento,
    descripcionDescuento: descuento.descripcionDescuento,
  };
};

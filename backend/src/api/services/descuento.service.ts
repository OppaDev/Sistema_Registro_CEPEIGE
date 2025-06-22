import { PrismaClient } from "@prisma/client";
import {
  CreateDescuentoDto,
  UpdateDescuentoDto,
  DescuentoResponseDto,
} from "@/api/dtos/descuento.dto";
import { NotFoundError, AppError } from "@/utils/errorTypes";
import { toDescuentoResponseDto } from "@/api/services/mappers/descuento.mapper";

const prisma = new PrismaClient();

interface GetAllDescuentosOptions {
  page: number;
  limit: number;
  orderBy: string;
  order: "asc" | "desc";
}

export class DescuentoService {
  // Crear un nuevo descuento
  async createDescuento(
    descuentoData: CreateDescuentoDto
  ): Promise<DescuentoResponseDto> {
    try {
      const descuento = await prisma.descuento.create({
        data: {
          tipoDescuento: descuentoData.tipoDescuento,
          valorDescuento: descuentoData.valorDescuento,
          porcentajeDescuento: descuentoData.porcentajeDescuento,
          descripcionDescuento: descuentoData.descripcionDescuento,
        },
      });
      return toDescuentoResponseDto(descuento);
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          `Error al crear el descuento: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al crear el descuento", 500);
    }
  }

  // Actualizar un descuento existente
  async updateDescuento(
    id: number,
    descuentoData: UpdateDescuentoDto
  ): Promise<DescuentoResponseDto> {
    try {
      // Verificar si el descuento existe
      const descuentoExistente = await prisma.descuento.findUnique({
        where: { idDescuento: id },
      });

      if (!descuentoExistente) {
        throw new NotFoundError(`Descuento con ID ${id}`);
      }

      const descuento = await prisma.descuento.update({
        where: { idDescuento: id },
        data: descuentoData,
      });
      return toDescuentoResponseDto(descuento);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(
          `Error al actualizar el descuento: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al actualizar el descuento", 500);
    }
  }

  // Obtener todos los descuentos
  async getAllDescuentos(
    options: GetAllDescuentosOptions
  ): Promise<{ descuentos: DescuentoResponseDto[]; total: number }> {
    try {
      const { page, limit, orderBy, order } = options;
      const skip = (page - 1) * limit;

      const [descuentos, total] = await Promise.all([
        prisma.descuento.findMany({
          skip,
          take: limit,
          orderBy: {
            [orderBy]: order,
          },
        }),
        prisma.descuento.count(),
      ]);

      return {
        descuentos: descuentos.map((descuento) =>
          toDescuentoResponseDto(descuento)
        ),
        total,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          `Error al obtener los descuentos: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al obtener los descuentos", 500);
    }
  }

  // Obtener un descuento por ID
  async getDescuentoById(id: number): Promise<DescuentoResponseDto> {
    try {
      const descuento = await prisma.descuento.findUnique({
        where: { idDescuento: id },
      });

      if (!descuento) {
        throw new NotFoundError(`Descuento con ID ${id}`);
      }

      return toDescuentoResponseDto(descuento);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(
          `Error al obtener el descuento: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al obtener el descuento", 500);
    }
  }

  // Eliminar un descuento
  async deleteDescuento(id: number): Promise<DescuentoResponseDto> {
    try {
      // Verificar si el descuento existe
      const descuentoExistente = await prisma.descuento.findUnique({
        where: { idDescuento: id },
        include: { inscripciones: true },
      });

      if (!descuentoExistente) {
        throw new NotFoundError(`Descuento con ID ${id}`);
      }

      // Verificar si el descuento está siendo usado en alguna inscripción
      if (
        descuentoExistente.inscripciones &&
        descuentoExistente.inscripciones.length > 0
      ) {
        throw new AppError(
          `El descuento con ID ${id} no puede ser eliminado porque está asociado a una o más inscripciones.`,
          409
        );
      }

      // Eliminar el descuento
      const descuentoEliminado = await prisma.descuento.delete({
        where: { idDescuento: id },
      });

      return toDescuentoResponseDto(descuentoEliminado);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(
          `Error al eliminar el descuento: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al eliminar el descuento", 500);
    }
  }
}

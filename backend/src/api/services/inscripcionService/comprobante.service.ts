import { PrismaClient } from "@prisma/client";
import { ComprobanteResponseDto } from "@/api/dtos/inscripcionDto/comprobante.dto";
import { NotFoundError, AppError, ConflictError } from "@/utils/errorTypes";
import { deleteFile } from "@/config/multer"; // Importar helper para borrar archivo
import { toComprobanteResponseDto } from "@/api/services/mappers/inscripcionMapper/comprobante.mapper";

const prisma = new PrismaClient();

interface ComprobanteFileDataForCreation { // Interfaz para datos del archivo
  rutaComprobante: string;
  tipoArchivo: string;
  nombreArchivo: string;
}

export class ComprobanteService {
  
  // Crear un comprobante
  async createComprobante(data: ComprobanteFileDataForCreation): Promise<ComprobanteResponseDto> {
    try {
      const nuevoComprobante = await prisma.comprobante.create({
        data: {
          rutaComprobante: data.rutaComprobante,
          tipoArchivo: data.tipoArchivo,
          nombreArchivo: data.nombreArchivo,
        },
      });
      return toComprobanteResponseDto(nuevoComprobante);
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Error al crear el comprobante en la base de datos: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al crear el comprobante en la base de datos", 500);
    }
  }

  // Obtener un comprobante por su ID
  async getComprobanteById(idComprobante: number): Promise<ComprobanteResponseDto | null> {
    try {
      const comprobante = await prisma.comprobante.findUnique({
        where: { idComprobante },
      });

      if (!comprobante) {
        return null;
      }
      return toComprobanteResponseDto(comprobante);
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Error al obtener el comprobante: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener el comprobante", 500);
    }
  }

  // Eliminar un comprobante
  async deleteComprobante(idComprobante: number): Promise<void> {
    const comprobante = await prisma.comprobante.findUnique({
      where: { idComprobante },
      include: { inscripcion: true },
    });

    if (!comprobante) {
      throw new NotFoundError(`Comprobante con ID ${idComprobante}`);
    }

    if (comprobante.inscripcion) {
      throw new ConflictError(
        `El comprobante con ID ${idComprobante} no puede ser eliminado porque está asociado a la inscripción con ID ${comprobante.inscripcion.idInscripcion}.`
      );
    }

    const filePath = comprobante.rutaComprobante;

    try {
      await prisma.comprobante.delete({
        where: { idComprobante },
      });

      try {
        await deleteFile(filePath);
      } catch (fileError) {
        console.warn(`Registro de comprobante ${idComprobante} eliminado de la BD, pero falló la eliminación del archivo ${filePath}:`, fileError);
      }

    } catch (dbError) {
        if (dbError instanceof Error) {
            throw new AppError(`Error al eliminar el comprobante de la base de datos: ${dbError.message}`, 500);
        }
        throw new AppError("Error desconocido al eliminar el comprobante de la base de datos", 500);
    }
  }

  // Método para obtener todos los comprobantes (ej. para un admin)
  async getAllComprobantes(options: { page: number, limit: number }): Promise<{ comprobantes: ComprobanteResponseDto[], total: number }> {
    try {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const [comprobantesData, total] = await prisma.$transaction([
            prisma.comprobante.findMany({
                skip,
                take: limit,
                orderBy: { fechaSubida: 'desc' }
            }),
            prisma.comprobante.count()
        ]);
          return {
            comprobantes: comprobantesData.map(toComprobanteResponseDto),
            total
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new AppError(`Error al obtener todos los comprobantes: ${error.message}`, 500);
        }
        throw new AppError("Error desconocido al obtener todos los comprobantes", 500);
    }
  }
}
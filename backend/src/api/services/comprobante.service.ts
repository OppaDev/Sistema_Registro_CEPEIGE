import { PrismaClient, Comprobante as PrismaComprobante } from "@prisma/client";
import { ComprobanteResponseDto } from "@/api/dtos/comprobante.dto";
import { NotFoundError, AppError, ConflictError } from "@/utils/errorTypes";
import { deleteFile } from "@/config/multer"; // Importar helper para borrar archivo

const prisma = new PrismaClient();

interface ComprobanteFileDataForCreation { // Interfaz para datos del archivo
  rutaComprobante: string;
  tipoArchivo: string;
  nombreArchivo: string;
}

export class ComprobanteService {
  private toComprobanteResponseDto(comprobante: PrismaComprobante): ComprobanteResponseDto {
    return {
      idComprobante: comprobante.idComprobante,
      fechaSubida: comprobante.fechaSubida,
      rutaComprobante: comprobante.rutaComprobante,
      tipoArchivo: comprobante.tipoArchivo,
      nombreArchivo: comprobante.nombreArchivo,
    };
  }

  async createComprobante(data: ComprobanteFileDataForCreation): Promise<ComprobanteResponseDto> {
    try {
      const nuevoComprobante = await prisma.comprobante.create({
        data: {
          rutaComprobante: data.rutaComprobante,
          tipoArchivo: data.tipoArchivo,
          nombreArchivo: data.nombreArchivo,
        },
      });
      return this.toComprobanteResponseDto(nuevoComprobante);
    } catch (error) {
      // No hay errores de FK o unique esperados aquí al crear solo el comprobante
      if (error instanceof Error) {
        throw new AppError(`Error al crear el comprobante en la base de datos: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al crear el comprobante en la base de datos", 500);
    }
  }

  async getComprobanteById(idComprobante: number): Promise<ComprobanteResponseDto | null> {
    try {
      const comprobante = await prisma.comprobante.findUnique({
        where: { idComprobante },
      });

      if (!comprobante) {
        // Devolver null para que el controlador decida si es 404 o maneja el null
        return null;
      }
      return this.toComprobanteResponseDto(comprobante);
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Error al obtener el comprobante: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener el comprobante", 500);
    }
  }

  async deleteComprobante(idComprobante: number): Promise<void> {
    // Transacción para asegurar atomicidad: borrar de BD y luego del sistema de archivos
    // O manejar el borrado de archivo como "mejor esfuerzo" si la BD falla.
    // Aquí, primero verificamos y luego borramos en secuencia.

    const comprobante = await prisma.comprobante.findUnique({
      where: { idComprobante },
      include: { factura: true }, // Para verificar si está en uso
    });

    if (!comprobante) {
      throw new NotFoundError(`Comprobante con ID ${idComprobante}`);
    }

    if (comprobante.factura) { // Si el campo 'factura' (opcional) no es null
      throw new ConflictError(
        `El comprobante con ID ${idComprobante} no puede ser eliminado porque está asociado a la factura con ID ${comprobante.factura.idFactura}.`
      );
    }

    const filePath = comprobante.rutaComprobante;

    try {
      await prisma.comprobante.delete({
        where: { idComprobante },
      });

      // Si la eliminación de la BD fue exitosa, intenta borrar el archivo
      try {
        await deleteFile(filePath);
      } catch (fileError) {
        // Loguear que el archivo no pudo ser borrado, pero la BD ya está limpia.
        // Esto podría requerir una tarea de limpieza manual o un log más persistente.
        console.warn(`Registro de comprobante ${idComprobante} eliminado de la BD, pero falló la eliminación del archivo ${filePath}:`, fileError);
      }

    } catch (dbError) {
        // Este catch es por si el delete de prisma falla por alguna otra razón no esperada
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
            comprobantes: comprobantesData.map(this.toComprobanteResponseDto),
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
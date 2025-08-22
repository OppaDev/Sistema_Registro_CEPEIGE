import { PrismaClient } from "@prisma/client";
import {
  CreateDatosFacturacionDto,
  UpdateDatosFacturacionDto,
  DatosFacturacionResponseDto,
} from "@/api/dtos/inscripcionDto/datosFacturacion.dto";
import { NotFoundError, ConflictError} from "@/utils/errorTypes";
import { toDatosFacturacionResponseDto } from "@/api/services/mappers/inscripcionMapper/datosFacturacion.mapper";

const prisma = new PrismaClient();

interface GetAllDatosFacturacionOptions {
  page: number;
  limit: number;
  order: "asc" | "desc";
  orderBy?: string;
}

export class DatosFacturacionService {
  // Crear datos de facturación
  async createDatosFacturacion(
    datosFacturacionData: CreateDatosFacturacionDto
  ): Promise<DatosFacturacionResponseDto> {
    try {
      const datosFacturacion = await prisma.datosFacturacion.create({
        data: {
          razonSocial: datosFacturacionData.razonSocial,
          identificacionTributaria: datosFacturacionData.identificacionTributaria,
          telefono: datosFacturacionData.telefono,
          correoFactura: datosFacturacionData.correoFactura,
          direccion: datosFacturacionData.direccion,        },
      });      return toDatosFacturacionResponseDto(datosFacturacion);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const uniqueField = error.meta?.target?.[0];
        if (uniqueField === 'identificacion_tributaria') {
          throw new ConflictError('La identificación tributaria ya está registrada');
        } else {
          throw new ConflictError('Ya existe un registro con estos datos únicos');
        }
      }
      if (error instanceof Error) {
        throw new Error(`Error al crear los datos de facturación: ${error.message}`);
      }
      throw new Error('Error desconocido al crear los datos de facturación');
    }
  }

  // Obtener todos los datos de facturación
  async getAllDatosFacturacion(options: GetAllDatosFacturacionOptions): Promise<{ datosFacturacion: DatosFacturacionResponseDto[]; total: number }> {
    try {
      const { page, limit, order, orderBy } = options;
      const skip = (page - 1) * limit;
      const orderByField = orderBy || 'razonSocial';
      const [datosFacturacion, total] = await Promise.all([
        prisma.datosFacturacion.findMany({
          skip,
          take: limit,
          orderBy: { [orderByField]: order },
        }),
        prisma.datosFacturacion.count(),
      ]);      return {
        datosFacturacion: datosFacturacion.map((datos) => toDatosFacturacionResponseDto(datos)),
        total,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener los datos de facturación: ${error.message}`);
      }
      throw new Error('Error desconocido al obtener los datos de facturación');
    }
  }

  // Obtener datos de facturación por ID
  async getDatosFacturacionById(id: number): Promise<DatosFacturacionResponseDto> {
    try {
      const datosFacturacion = await prisma.datosFacturacion.findUnique({
        where: { idFacturacion: id },
      });
      if (!datosFacturacion) {
        throw new NotFoundError('Datos de facturación');      }
      return toDatosFacturacionResponseDto(datosFacturacion);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error; // Re-lanzar NotFoundError sin modificar
      }
      if (error instanceof Error) {
        throw new Error(`Error al obtener los datos de facturación: ${error.message}`);
      }
      throw new Error('Error desconocido al obtener los datos de facturación');
    }
  }

  // Obtener datos de facturación por identificación tributaria
  async getDatosFacturacionByIdentificacion(identificacionTributaria: string): Promise<DatosFacturacionResponseDto> {
    try {
      const datosFacturacion = await prisma.datosFacturacion.findUnique({
        where: { identificacionTributaria },
      });
      if (!datosFacturacion) {
        throw new NotFoundError('Datos de facturación');
      }
      return toDatosFacturacionResponseDto(datosFacturacion);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error; // Re-lanzar NotFoundError sin modificar
      }
      if (error instanceof Error) {
        throw new Error(`Error al obtener los datos de facturación: ${error.message}`);
      }
      throw new Error('Error desconocido al obtener los datos de facturación');
    }
  }

  // Actualizar datos de facturación
  async updateDatosFacturacion(
    id: number,
    datosFacturacionData: UpdateDatosFacturacionDto
  ): Promise<DatosFacturacionResponseDto> {
    try {
      const datosFacturacionExistente = await prisma.datosFacturacion.findUnique({
        where: { idFacturacion: id },
      });
      if (!datosFacturacionExistente) {
        throw new NotFoundError('Datos de facturación');
      }
      const datosActualizados: any = { ...datosFacturacionData };
      const datosFacturacion = await prisma.datosFacturacion.update({
        where: { idFacturacion: id },        data: datosActualizados,
      });      return toDatosFacturacionResponseDto(datosFacturacion);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const uniqueField = error.meta?.target?.[0];
        if (uniqueField === 'identificacion_tributaria') {
          throw new ConflictError('La identificación tributaria ya está registrada');
        } else {
          throw new ConflictError('Ya existe un registro con estos datos únicos');
        }
      }
      if (error instanceof NotFoundError) {
        throw error; // Re-lanzar NotFoundError sin modificar
      }
      if (error instanceof Error) {
        throw new Error(`Error al actualizar los datos de facturación: ${error.message}`);
      }
      throw new Error('Error desconocido al actualizar los datos de facturación');
    }
  }

  // Eliminar datos de facturación
  async deleteDatosFacturacion(id: number): Promise<DatosFacturacionResponseDto> {
    try {
      const datosFacturacionExistente = await prisma.datosFacturacion.findUnique({
        where: { idFacturacion: id },
      });
      if (!datosFacturacionExistente) {
        throw new NotFoundError('Datos de facturación');
      }
      const datosFacturacionEliminado = await prisma.datosFacturacion.delete({        where: { idFacturacion: id },
      });
      return toDatosFacturacionResponseDto(datosFacturacionEliminado);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error; // Re-lanzar NotFoundError sin modificar
      }
      if (error instanceof Error) {
        throw new Error(`Error al eliminar los datos de facturación: ${error.message}`);
      }
      throw new Error('Error desconocido al eliminar los datos de facturación');
    }
  }
}

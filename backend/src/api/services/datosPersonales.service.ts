import { PrismaClient } from "@prisma/client";
import {
  CreateDatosPersonalesDto,
  DatosPersonalesResponseDto,
  UpdateDatosPersonalesDto,
} from "@/api/dtos/datosPersonales.dto";
import { NotFoundError } from "@/utils/errorTypes";

const prisma = new PrismaClient();

interface GetAllDatosPersonalesOptions {
  page: number;
  limit: number;
  order: "asc" | "desc";
}

export class DatosPersonalesService {
  // Función privada para mapear el modelo de Prisma al DTO de respuesta
  private toDatosPersonalesResponseDto(datos: any): DatosPersonalesResponseDto {
    return {
      idPersona: datos.idPersona,
      ciPasaporte: datos.ciPasaporte,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      numTelefono: datos.numTelefono,
      correo: datos.correo,
      pais: datos.pais,
      provinciaEstado: datos.provinciaEstado,
      ciudad: datos.ciudad,
      profesion: datos.profesion,
      institucion: datos.institucion,
    };
  }

  //crear nuevos datos personales
  async createDatosPersonales(
    datosPersonalesData: CreateDatosPersonalesDto
  ): Promise<DatosPersonalesResponseDto> {
    try {
      const datosPersonales = await prisma.datosPersonales.create({
        data: {
          ciPasaporte: datosPersonalesData.ciPasaporte,
          nombres: datosPersonalesData.nombres,
          apellidos: datosPersonalesData.apellidos,
          numTelefono: datosPersonalesData.numTelefono,
          correo: datosPersonalesData.correo,
          pais: datosPersonalesData.pais,
          provinciaEstado: datosPersonalesData.provinciaEstado,
          ciudad: datosPersonalesData.ciudad,
          profesion: datosPersonalesData.profesion,
          institucion: datosPersonalesData.institucion,
        },
      });
      return this.toDatosPersonalesResponseDto(datosPersonales);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error al crear los datos personales: ${error.message}`
        );
      }
      throw new Error("Error desconocido al crear los datos personales");
    }
  }

  //mostrar todos los datos personales
  async getAllDatosPersonales(options: GetAllDatosPersonalesOptions) {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const [datosPersonales, total] = await Promise.all([
        prisma.datosPersonales.findMany({
          skip,
          take: limit,
        }),
        prisma.datosPersonales.count(),
      ]);

      return {
        datosPersonales: datosPersonales.map((datos) =>
          this.toDatosPersonalesResponseDto(datos)
        ),
        total,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error al obtener los datos personales: ${error.message}`
        );
      }
      throw new Error("Error desconocido al obtener los datos personales");
    }
  }

  //obtener un dato personal por su id
  async getDatosPersonalesById(
    id: number
  ): Promise<DatosPersonalesResponseDto> {
    try {
      const datosPersonales = await prisma.datosPersonales.findUnique({
        where: { idPersona: id },
      });

      if (!datosPersonales) {
        throw new NotFoundError("Datos personales");
      }

      return this.toDatosPersonalesResponseDto(datosPersonales);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error al obtener los datos personales: ${error.message}`
        );
      }
      throw new Error("Error desconocido al obtener los datos personales");
    }
  }

  //actualizar un dato personal por su id
  async updateDatosPersonales(
    id: number,
    datosPersonalesData: UpdateDatosPersonalesDto
  ) {
    try {
      //verificar si los datos existen
      const datosPersonalesExistentes = await prisma.datosPersonales.findUnique(
        {
          where: { idPersona: id },
        }
      );

      if (!datosPersonalesExistentes) {
        throw new NotFoundError("Datos personales");
      }

      //preparar los datos para la actualizacion
      const datosActualizados: any = { ...datosPersonalesData };

      //actualizar los datos
      const datosPersonales = await prisma.datosPersonales.update({
        where: { idPersona: id },
        data: datosActualizados,
      });
      return this.toDatosPersonalesResponseDto(datosPersonales);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error al actualizar los datos personales: ${error.message}`
        );
      }
      throw new Error("Error desconocido al actualizar los datos personales");
    }
  }

  //Eliminar datos Personales
  async deleteDatosPersonales(id: number) {
    try {
      //verificar si los datos existen
      const datosPersonalesExistentes = await prisma.datosPersonales.findUnique({
        where: { idPersona: id },
      });

      if (!datosPersonalesExistentes) {
        throw new NotFoundError("Datos personales");
      }
      //eliminar los datos
      const datosPersonalesEliminados = await prisma.datosPersonales.delete({
        where: { idPersona: id },
      });
      return this.toDatosPersonalesResponseDto(datosPersonalesEliminados);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al eliminar los datos personales: ${error.message}`);
      }
      throw new Error("Error desconocido al eliminar los datos personales");
    }
  }

  //Buscar datos personales por ci o pasaporte
  async getByCiPasaporte(ciPasaporte: string): Promise<DatosPersonalesResponseDto | null> {
    try {
      const datosPersonales = await prisma.datosPersonales.findUnique({
        where: { ciPasaporte: ciPasaporte },
      });
      if (!datosPersonales) {
        throw new NotFoundError(`Datos personales con CI/Pasaporte '${ciPasaporte}'`);
      }
      return this.toDatosPersonalesResponseDto(datosPersonales);

    } catch(error) {
      if (error instanceof Error) {
        throw new Error(`Error al buscar los datos personales: ${error.message}`);
      }
      throw new Error("Error desconocido al buscar los datos personales");
    }
  }
}

import { PrismaClient } from "@prisma/client";
import {
  CreateDatosPersonalesDto,
  DatosPersonalesResponseDto,
  UpdateDatosPersonalesDto,
} from "@/api/dtos/datosPersonales.dto";
import { NotFoundError, ConflictError } from "@/utils/errorTypes";
import { toDatosPersonalesResponseDto } from "@/api/services/mappers/datosPersonales.mapper";
import { CedulaEcuatorianaValidator } from "@/utils/cedulaValidator";

const prisma = new PrismaClient();

interface GetAllDatosPersonalesOptions {
  page: number;
  limit: number;
  order: "asc" | "desc";
  orderBy?: string;
}

export class DatosPersonalesService {  //crear nuevos datos personales
  async createDatosPersonales(
    datosPersonalesData: CreateDatosPersonalesDto
  ): Promise<DatosPersonalesResponseDto> {
    try {
      // Limpiar y formatear la cédula (el validador ya verificó que es válida)
      const cedulaFormateada = CedulaEcuatorianaValidator.validateAndFormat(datosPersonalesData.ciPasaporte);
      
      if (!cedulaFormateada) {
        throw new Error("La cédula proporcionada no es válida");
      }

      const datosPersonales = await prisma.datosPersonales.create({
        data: {
          ciPasaporte: cedulaFormateada, // Usar la cédula formateada
          nombres: datosPersonalesData.nombres,
          apellidos: datosPersonalesData.apellidos,
          numTelefono: datosPersonalesData.numTelefono,
          correo: datosPersonalesData.correo,
          pais: datosPersonalesData.pais,
          provinciaEstado: datosPersonalesData.provinciaEstado,
          ciudad: datosPersonalesData.ciudad,
          profesion: datosPersonalesData.profesion,
          institucion: datosPersonalesData.institucion,        },
      });
      return toDatosPersonalesResponseDto(datosPersonales);    } catch (error: any) {
      if (error.code === 'P2002') {
        const uniqueField = error.meta?.target?.[0];
        if (uniqueField === 'ci_pasaporte') {
          throw new ConflictError('El CI o Pasaporte ya está registrado');
        } else if (uniqueField === 'correo') {
          throw new ConflictError('El correo electrónico ya está registrado');
        } else {
          throw new ConflictError('Ya existe un registro con estos datos únicos');
        }
      }
      if (error instanceof Error) {
        throw new Error(
          `Error al crear los datos personales: ${error.message}`
        );
      }
      throw new Error("Error desconocido al crear los datos personales");
    }
  }

  //mostrar todos los datos personales
  async getAllDatosPersonales(options: GetAllDatosPersonalesOptions): Promise<{ datosPersonales: DatosPersonalesResponseDto[]; total: number }> {
    try {
      const { page, limit, order, orderBy } = options;
      const skip = (page - 1) * limit;
      const orderByField = orderBy || 'apellidos';
      const [datosPersonales, total] = await Promise.all([
        prisma.datosPersonales.findMany({
          skip,
          take: limit,
          orderBy: { [orderByField]: order },
        }),
        prisma.datosPersonales.count(),
      ]);      return {
        datosPersonales: datosPersonales.map((datos) =>
          toDatosPersonalesResponseDto(datos)
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
        throw new NotFoundError("Datos personales");      }

      return toDatosPersonalesResponseDto(datosPersonales);
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
  ): Promise<DatosPersonalesResponseDto> {
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
        where: { idPersona: id },        data: datosActualizados,
      });      return toDatosPersonalesResponseDto(datosPersonales);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const uniqueField = error.meta?.target?.[0];
        if (uniqueField === 'ci_pasaporte') {
          throw new ConflictError('El CI o Pasaporte ya está registrado');
        } else if (uniqueField === 'correo') {
          throw new ConflictError('El correo electrónico ya está registrado');
        } else {
          throw new ConflictError('Ya existe un registro con estos datos únicos');
        }
      }
      if (error instanceof Error) {
        throw new Error(
          `Error al actualizar los datos personales: ${error.message}`
        );
      }
      throw new Error("Error desconocido al actualizar los datos personales");
    }
  }

  //Eliminar datos Personales
  async deleteDatosPersonales(id: number): Promise<DatosPersonalesResponseDto> {
    try {
      //verificar si los datos existen
      const datosPersonalesExistentes = await prisma.datosPersonales.findUnique({
        where: { idPersona: id },
      });

      if (!datosPersonalesExistentes) {
        throw new NotFoundError("Datos personales");
      }
      //eliminar los datos
      const datosPersonalesEliminados = await prisma.datosPersonales.delete({        where: { idPersona: id },
      });
      return toDatosPersonalesResponseDto(datosPersonalesEliminados);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al eliminar los datos personales: ${error.message}`);
      }
      throw new Error("Error desconocido al eliminar los datos personales");
    }
  }
  //Buscar datos personales por ci o pasaporte
  async getByCiPasaporte(ciPasaporte: string): Promise<DatosPersonalesResponseDto> {
    try {
      // Limpiar y formatear la cédula para la búsqueda
      const cedulaFormateada = CedulaEcuatorianaValidator.validateAndFormat(ciPasaporte);
      
      if (!cedulaFormateada) {
        throw new Error("La cédula proporcionada no es válida");
      }

      const datosPersonales = await prisma.datosPersonales.findUnique({
        where: { ciPasaporte: cedulaFormateada }, // Buscar con la cédula formateada
      });
      if (!datosPersonales) {
        throw new NotFoundError(`Datos personales con CI/Pasaporte '${ciPasaporte}'`);      }
      return toDatosPersonalesResponseDto(datosPersonales);

    } catch(error) {
      if (error instanceof Error) {
        throw new Error(`Error al buscar los datos personales: ${error.message}`);
      }
      throw new Error("Error desconocido al buscar los datos personales");
    }
  }
}

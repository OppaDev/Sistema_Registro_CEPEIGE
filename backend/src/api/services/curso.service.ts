import { PrismaClient } from "@prisma/client";
import {
  CreateCursoDto,
  UpdateCursoDto,
  CursoResponseDto,
  CursosDisponiblesDto,
} from "@/api/dtos/curso.dto";
import { NotFoundError } from "@/utils/errorTypes";
import { toCursoResponseDto } from "@/api/services/mappers/curso.mapper";

const prisma = new PrismaClient();

interface GetAllCursosOptions {
  page: number;
  limit: number;
  orderBy: string;
  order: "asc" | "desc";
}

export class CursoService {
  // Crear un nuevo curso
  async createCurso(cursoData: CreateCursoDto): Promise<CursoResponseDto> {
    try {
      const curso = await prisma.curso.create({
        data: {
          nombreCortoCurso: cursoData.nombreCortoCurso,
          nombreCurso: cursoData.nombreCurso,
          descripcionCurso: cursoData.descripcionCurso,
          valorCurso: cursoData.valorCurso,
          fechaInicioCurso: new Date(cursoData.fechaInicioCurso),
          fechaFinCurso: new Date(cursoData.fechaFinCurso),        },
      });
      return toCursoResponseDto(curso);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al crear el curso: ${error.message}`);
      }
      throw new Error("Error desconocido al crear el curso");
    }
  }

  // Actualizar un curso existente
  async updateCurso(id: number, cursoData: UpdateCursoDto): Promise<CursoResponseDto> {
    try {
      // Verificar si el curso existe
      const cursoExistente = await prisma.curso.findUnique({
        where: { idCurso: id },
      });

      if (!cursoExistente) {
        throw new NotFoundError('Curso');
      }

      // Preparar los datos para la actualización
      const datosActualizados: any = { ...cursoData };

      // Convertir fechas si están presentes
      if (cursoData.fechaInicioCurso) {
        datosActualizados.fechaInicioCurso = new Date(
          cursoData.fechaInicioCurso
        );
      }
      if (cursoData.fechaFinCurso) {
        datosActualizados.fechaFinCurso = new Date(cursoData.fechaFinCurso);
      }

      const curso = await prisma.curso.update({
        where: { idCurso: id },        data: datosActualizados,
      });
      return toCursoResponseDto(curso);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al actualizar el curso: ${error.message}`);
      }
      throw new Error("Error desconocido al actualizar el curso");
    }
  }

  // Mostrar todos los cursos
  async getAllCursos(options: GetAllCursosOptions): Promise<{ cursos: CursoResponseDto[]; total: number }> {
    try {
      const { page, limit, orderBy, order } = options;
      const skip = (page - 1) * limit;

      const [cursos, total] = await Promise.all([
        prisma.curso.findMany({
          skip,
          take: limit,
          orderBy: {
            [orderBy]: order,
          },
        }),
        prisma.curso.count(),
      ]);

      return { cursos: cursos.map((curso) => toCursoResponseDto(curso)), total };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener los cursos: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener los cursos");
    }
  }

  // Mostrar un curso por id
  async getCursoById(id: number): Promise<CursoResponseDto> {
    try {
      const curso = await prisma.curso.findUnique({
        where: { idCurso: id },
      });

      if (!curso) {
        throw new NotFoundError('Curso');      }

      return toCursoResponseDto(curso);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener el curso: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener el curso");
    }
  }

  // Obtener cursos disponibles
  async getCursosDisponibles(): Promise<CursosDisponiblesDto[]> {
    try {
      const fechaActual = new Date();

      const cursos = await prisma.curso.findMany({
        where: {
          fechaInicioCurso: {
            gte: fechaActual,
          },
        },
        select: {
          idCurso: true,
          nombreCurso: true,
          valorCurso: true,
          fechaInicioCurso: true,
          fechaFinCurso: true,
        },
        orderBy: {
          fechaInicioCurso: "asc",
        },
      });

      return cursos;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error al obtener los cursos disponibles: ${error.message}`
        );
      }
      throw new Error("Error desconocido al obtener los cursos disponibles");
    }
  }
  
  //Eliminar un curso
  async deleteCurso(id: number): Promise<CursoResponseDto> {
    try {
      // Verificar si el curso existe
      const cursoExistente = await prisma.curso.findUnique({
        where: { idCurso: id },
      });

      if (!cursoExistente) {
        throw new NotFoundError('Curso');
      }

      // Eliminar el curso
      const cursoEliminado = await prisma.curso.delete({
        where: { idCurso: id },      });

      return toCursoResponseDto(cursoEliminado);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al eliminar el curso: ${error.message}`);
      }
      throw new Error("Error desconocido al eliminar el curso");
    }
  }
}

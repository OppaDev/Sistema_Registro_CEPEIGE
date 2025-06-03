import { PrismaClient } from "@prisma/client";
import { CreateCursoDto, UpdateCursoDto, CursoResponseDto, CursosDisponiblesDto } from "@/api/dtos/curso.dto";

const prisma = new PrismaClient();

interface GetAllCursosOptions {
  page: number;
  limit: number;
  orderBy: string;
  order: 'asc' | 'desc';
}

export class CursoService {
    // Crear un nuevo curso
  async createCurso(cursoData: CreateCursoDto) {
    try {
      const curso = await prisma.curso.create({
        data: {
          nombreCortoCurso: cursoData.nombreCortoCurso,
          nombreCurso: cursoData.nombreCurso,
          descripcionCurso: cursoData.descripcionCurso,
          valorCurso: cursoData.valorCurso,
          fechaInicioCurso: new Date(cursoData.fechaInicioCurso),
          fechaFinCurso: new Date(cursoData.fechaFinCurso),
        },
      });
      return curso;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al crear el curso: ${error.message}`);
      }
      throw new Error("Error desconocido al crear el curso");
    }
  }

  // Actualizar un curso existente
  async updateCurso(id: number, cursoData: UpdateCursoDto) {
    try {
      // Verificar si el curso existe
      const cursoExistente = await prisma.curso.findUnique({
        where: { idCurso: id }
      });

      if (!cursoExistente) {
        throw new Error(`No se encontró el curso con ID ${id}`);
      }

      // Preparar los datos para la actualización
      const datosActualizados: any = { ...cursoData };
      
      // Convertir fechas si están presentes
      if (cursoData.fechaInicioCurso) {
        datosActualizados.fechaInicioCurso = new Date(cursoData.fechaInicioCurso);
      }
      if (cursoData.fechaFinCurso) {
        datosActualizados.fechaFinCurso = new Date(cursoData.fechaFinCurso);
      }

      const curso = await prisma.curso.update({
        where: { idCurso: id },
        data: datosActualizados,
      });
      return curso;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al actualizar el curso: ${error.message}`);
      }
      throw new Error("Error desconocido al actualizar el curso");
    }
  }

  // Mostrar todos los cursos
  async getAllCursos(options: GetAllCursosOptions) {
    try {
      const { page, limit, orderBy, order } = options;
      const skip = (page - 1) * limit;

      const [cursos, total] = await Promise.all([
        prisma.curso.findMany({
          skip,
          take: limit,
          orderBy: {
            [orderBy]: order
          }
        }),
        prisma.curso.count()
      ]);

      return { cursos, total };
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
        where: { idCurso: id }
      });

      if (!curso) {
        throw new Error(`No se encontró el curso con ID ${id}`);
      }

      return curso;
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
            gte: fechaActual
          }
        },
        select: {
          idCurso: true,
          nombreCurso: true,
          valorCurso: true,
          fechaInicioCurso: true,
          fechaFinCurso: true
        },
        orderBy: {
          fechaInicioCurso: 'asc'
        }
      });

      return cursos;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener los cursos disponibles: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener los cursos disponibles");
    }
  }
}

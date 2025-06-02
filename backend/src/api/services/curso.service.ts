import { PrismaClient } from "@prisma/client";
import { CreateCursoDto, UpdateCursoDto } from "@/api/dtos/curso.dto";

const prisma = new PrismaClient();

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
}

import { PrismaClient } from "@prisma/client";
import { CreateCursoDto } from "@/api/dtos/curso.dto";

const prisma = new PrismaClient();

export class CursoService {
  async createCurso(cursoData: CreateCursoDto) {
    try {
      // Validar que todos los campos requeridos estén presentes
      if (!cursoData.nombreCortoCurso || !cursoData.nombreCurso || 
          !cursoData.descripcionCurso || !cursoData.valorCurso || 
          !cursoData.fechaInicioCurso || !cursoData.fechaFinCurso) {
        throw new Error('Todos los campos son requeridos');
      }

      const curso = await prisma.curso.create({
        data: {
          nombreCortoCurso: cursoData.nombreCortoCurso,
          nombreCurso: cursoData.nombreCurso,
          descripcionCurso: cursoData.descripcionCurso,
          valorCurso: cursoData.valorCurso,
          fechaInicioCurso: cursoData.fechaInicioCurso,
          fechaFinCurso: cursoData.fechaFinCurso,
        },
      });
      return curso;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al crear el curso: ${error.message}`);
      }
      throw new Error('Error desconocido al crear el curso');
    }
  }
}

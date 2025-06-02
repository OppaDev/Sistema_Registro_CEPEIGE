import { Request, Response } from 'express';
import { CreateCursoDto, UpdateCursoDto } from '@/api/dtos/curso.dto';
import { CursoService } from '@/api/services/curso.service';

const cursoService = new CursoService();

export class CursoController {
  // Crear un nuevo curso
  async create(req: Request, res: Response) {
    try {
      const cursoData: CreateCursoDto = req.body;
      const curso = await cursoService.createCurso(cursoData);

      return res.status(201).json({
        success: true,
        data: curso,
        message: 'Curso creado exitosamente',
      });
    } catch (error) {
      console.error('Error al crear el curso:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear el curso',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  // Actualizar un curso existente
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cursoId = parseInt(id, 10);

      if (isNaN(cursoId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID del curso debe ser un número válido',
        });
      }

      const cursoData: UpdateCursoDto = req.body;
      const curso = await cursoService.updateCurso(cursoId, cursoData);

      return res.status(200).json({
        success: true,
        data: curso,
        message: 'Curso actualizado exitosamente',
      });
    } catch (error) {
      console.error('Error al actualizar el curso:', error);
      
      // Manejar el caso específico de curso no encontrado
      if (error instanceof Error && error.message.includes('No se encontró el curso')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el curso',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
 

  
} 
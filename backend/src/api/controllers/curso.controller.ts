import { Request, Response } from 'express';
import { CreateCursoDto } from '@/api/dtos/curso.dto';
import { CursoService } from '@/api/services/curso.service';

const cursoService = new CursoService();

export class CursoController {
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
} 
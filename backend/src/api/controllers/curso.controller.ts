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
 
  // Mostrar todos los cursos
  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const orderBy = (req.query['orderBy'] as string) || 'fechaInicioCurso';
      const order = (req.query['order'] as string)?.toUpperCase() === 'DESC' ? 'desc' : 'asc';

      const { cursos, total } = await cursoService.getAllCursos({
        page,
        limit,
        orderBy,
        order
      });

      return res.status(200).json({
        success: true,
        data: cursos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Cursos obtenidos exitosamente',
      });
    } catch (error) {
      console.error('Error al obtener todos los cursos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener todos los cursos',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  // Mostrar un curso por id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cursoId = parseInt(id, 10);

      if (isNaN(cursoId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID del curso debe ser un número válido',
        });
      }

      const curso = await cursoService.getCursoById(cursoId);

      return res.status(200).json({
        success: true,
        data: curso,
        message: 'Curso obtenido exitosamente',
      });
    } catch (error) {
      console.error('Error al obtener el curso por ID:', error);
      
      // Manejar el caso específico de curso no encontrado
      if (error instanceof Error && error.message.includes('No se encontró el curso')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al obtener el curso por ID',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  // Obtener cursos disponibles
  async getCursosDisponibles(_req: Request, res: Response) {
    try {
      const cursos = await cursoService.getCursosDisponibles();

      return res.status(200).json({
        success: true,
        data: cursos,
        message: 'Cursos disponibles obtenidos exitosamente',
      });
    } catch (error) {
      console.error('Error al obtener los cursos disponibles:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener los cursos disponibles',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  // Eliminar un curso
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cursoId = parseInt(id, 10);

      if (isNaN(cursoId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID del curso debe ser un número válido',
        });
      }

      const cursoEliminado = await cursoService.deleteCurso(cursoId);

      return res.status(200).json({
        success: true,
        data: cursoEliminado,
        message: 'Curso eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar el curso:', error);

      // Manejar el caso específico de curso no encontrado
      if (error instanceof Error && error.message.includes('No se encontró el curso')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el curso',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
} 
import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '@/api/services/authService/usuario.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from '@/api/dtos/authDto/usuario.dto';
import { BadRequestError } from '@/utils/errorTypes';

const usuarioService = new UsuarioService();

export class UsuarioController {
  /**
   * Crear un nuevo usuario
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createDto: CreateUsuarioDto = req.body;
      const usuario = await usuarioService.createUsuario(createDto);

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los usuarios con paginación
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;

      if (page < 1 || limit < 1 || limit > 100) {
        throw new BadRequestError('Parámetros de paginación inválidos');
      }

      const result = await usuarioService.getAllUsuarios(page, limit);

      res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: result.usuarios,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          total: result.total,
          limit: limit
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener un usuario por ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id'], 10);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de usuario inválido');
      }

      const usuario = await usuarioService.getUsuarioById(id);

      res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: usuario
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar un usuario
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id'], 10);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de usuario inválido');
      }

      const updateDto: UpdateUsuarioDto = req.body;
      const usuario = await usuarioService.updateUsuario(id, updateDto);

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un usuario (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id'], 10);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de usuario inválido');
      }

      await usuarioService.deleteUsuario(id);

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }
}

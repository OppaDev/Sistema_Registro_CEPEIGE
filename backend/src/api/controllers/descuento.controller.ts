import { Request, Response, NextFunction } from 'express';
import { CreateDescuentoDto, UpdateDescuentoDto } from '@/api/dtos/descuento.dto';
import { DescuentoService } from '@/api/services/descuento.service';

const descuentoService = new DescuentoService();

export class DescuentoController {
  // Crear un nuevo descuento
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const descuentoData: CreateDescuentoDto = req.body;
      const descuento = await descuentoService.createDescuento(descuentoData);

      return res.status(201).json({
        success: true,
        data: descuento,
        message: 'Descuento creado exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Actualizar un descuento existente
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const descuentoId = parseInt(id, 10);

      if (isNaN(descuentoId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID del descuento debe ser un número válido',
        });
      }

      const descuentoData: UpdateDescuentoDto = req.body;
      const descuento = await descuentoService.updateDescuento(descuentoId, descuentoData);

      return res.status(200).json({
        success: true,
        data: descuento,
        message: 'Descuento actualizado exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }
 
  // Obtener todos los descuentos
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const orderBy = (req.query['orderBy'] as string) || 'tipoDescuento';
      const order = (req.query['order'] as string)?.toUpperCase() === 'DESC' ? 'desc' : 'asc';

      const { descuentos, total } = await descuentoService.getAllDescuentos({
        page,
        limit,
        orderBy,
        order
      });

      return res.status(200).json({
        success: true,
        data: descuentos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Descuentos obtenidos exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener un descuento por ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const descuentoId = parseInt(id, 10);

      if (isNaN(descuentoId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID del descuento debe ser un número válido',
        });
      }

      const descuento = await descuentoService.getDescuentoById(descuentoId);

      return res.status(200).json({
        success: true,
        data: descuento,
        message: 'Descuento obtenido exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Eliminar un descuento
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const descuentoId = parseInt(id, 10);

      if (isNaN(descuentoId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID del descuento debe ser un número válido',
        });
      }

      const descuentoEliminado = await descuentoService.deleteDescuento(descuentoId);

      return res.status(200).json({
        success: true,
        data: descuentoEliminado,
        message: 'Descuento eliminado exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }
}

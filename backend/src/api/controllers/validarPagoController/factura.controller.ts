import { Request, Response, NextFunction } from 'express';
import { CreateFacturaDto, UpdateFacturaDto } from '@/api/dtos/validarPagoDto/factura.dto';
import { FacturaService } from '@/api/services/validarPagoService/factura.service';

const facturaService = new FacturaService();

export class FacturaController {
  // Crear una nueva factura
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const facturaData: CreateFacturaDto = req.body;
      const factura = await facturaService.createFactura(facturaData);

      return res.status(201).json({
        success: true,
        data: factura,
        message: 'Factura creada exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener todas las facturas
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const orderBy = (req.query['orderBy'] as string) || 'idFactura';
      const order = (req.query['order'] as string)?.toUpperCase() === 'DESC' ? 'desc' : 'asc';
      const includeRelations = req.query['includeRelations'] === 'true';

      const { facturas, total } = await facturaService.getAllFacturas({
        page,
        limit,
        orderBy,
        order,
        includeRelations
      });

      return res.status(200).json({
        success: true,
        data: facturas,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Facturas obtenidas exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener una factura por ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const facturaId = parseInt(id, 10);

      if (isNaN(facturaId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID de la factura debe ser un número válido',
        });
      }

      const includeRelations = req.query['includeRelations'] === 'true';
      const factura = await facturaService.getFacturaById(facturaId, includeRelations);

      return res.status(200).json({
        success: true,
        data: factura,
        message: 'Factura obtenida exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener factura por número de factura
  async getByNumeroFactura(req: Request, res: Response, next: NextFunction) {
    try {
      const { numeroFactura } = req.params;

      if (!numeroFactura) {
        return res.status(400).json({
          success: false,
          message: 'El número de factura es requerido',
        });
      }

      const factura = await facturaService.getFacturaByNumeroFactura(numeroFactura);

      return res.status(200).json({
        success: true,
        data: factura,
        message: 'Factura obtenida exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener factura por número de ingreso
  async getByNumeroIngreso(req: Request, res: Response, next: NextFunction) {
    try {
      const { numeroIngreso } = req.params;

      if (!numeroIngreso) {
        return res.status(400).json({
          success: false,
          message: 'El número de ingreso es requerido',
        });
      }

      const factura = await facturaService.getFacturaByNumeroIngreso(numeroIngreso);

      return res.status(200).json({
        success: true,
        data: factura,
        message: 'Factura obtenida exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener facturas por ID de inscripción
  async getByInscripcionId(req: Request, res: Response, next: NextFunction) {
    try {
      const { idInscripcion } = req.params;
      const inscripcionId = parseInt(idInscripcion, 10);

      if (isNaN(inscripcionId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID de la inscripción debe ser un número válido',
        });
      }

      const facturas = await facturaService.getFacturasByInscripcionId(inscripcionId);

      return res.status(200).json({
        success: true,
        data: facturas,
        message: 'Facturas obtenidas exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Actualizar factura (verificación de pago)
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const facturaId = parseInt(id, 10);

      if (isNaN(facturaId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID de la factura debe ser un número válido',
        });
      }

      const updateData: UpdateFacturaDto = req.body;
      
      // Si se está verificando el pago, usar el método específico
      if (updateData.verificacionPago === true) {
        const factura = await facturaService.verificarPago(facturaId);
        return res.status(200).json({
          success: true,
          data: factura,
          message: 'Pago verificado exitosamente',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Solo se permite actualizar la verificación de pago',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Verificar pago de una factura (método simplificado)
  async verificarPago(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const facturaId = parseInt(id, 10);

      if (isNaN(facturaId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID de la factura debe ser un número válido',
        });
      }

      const factura = await facturaService.verificarPago(facturaId);

      return res.status(200).json({
        success: true,
        data: factura,
        message: 'Pago verificado exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Eliminar una factura
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const facturaId = parseInt(id, 10);

      if (isNaN(facturaId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID de la factura debe ser un número válido',
        });
      }

      const facturaEliminada = await facturaService.deleteFactura(facturaId);

      return res.status(200).json({
        success: true,
        data: facturaEliminada,
        message: 'Factura eliminada exitosamente',
      });
    } catch (error) {
      return next(error);
    }
  }
}
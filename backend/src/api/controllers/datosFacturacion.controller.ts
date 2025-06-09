import { Request, Response, NextFunction } from "express";
import {
  CreateDatosFacturacionDto,
  UpdateDatosFacturacionDto,
} from "@/api/dtos/datosFacturacion.dto";
import { DatosFacturacionService } from "@/api/services/datosFacturacion.service";

const datosFacturacionService = new DatosFacturacionService();

export class DatosFacturacionController {
  // Crear datos de facturación
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const datosFacturacionData: CreateDatosFacturacionDto = req.body;
      const datosFacturacion = await datosFacturacionService.createDatosFacturacion(datosFacturacionData);
      return res.status(201).json({
        success: true,
        data: datosFacturacion,
        message: "Datos de facturación creados exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener todos los datos de facturación
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query["page"] as string) || 1;
      const limit = parseInt(req.query["limit"] as string) || 10;
      const orderBy = (req.query["orderBy"] as string) || "razonSocial";
      const order = (req.query["order"] as string)?.toUpperCase() === "DESC" ? "desc" : "asc";
      const { datosFacturacion, total } = await datosFacturacionService.getAllDatosFacturacion({
        page,
        limit,
        order,
        orderBy,
      });
      return res.status(200).json({
        success: true,
        data: datosFacturacion,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: "Datos de facturación obtenidos exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener datos de facturación por ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const idFacturacion = parseInt(id, 10);
      if (isNaN(idFacturacion)) {
        return res.status(400).json({
          success: false,
          message: "El ID de facturación debe ser un número válido",
        });
      }
      const datosFacturacion = await datosFacturacionService.getDatosFacturacionById(idFacturacion);
      return res.status(200).json({
        success: true,
        data: datosFacturacion,
        message: "Datos de facturación obtenidos exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Actualizar datos de facturación
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const idFacturacion = parseInt(id, 10);
      if (isNaN(idFacturacion)) {
        return res.status(400).json({
          success: false,
          message: "El ID de facturación debe ser un número válido",
        });
      }
      const datosFacturacionData: UpdateDatosFacturacionDto = req.body;
      const datosFacturacion = await datosFacturacionService.updateDatosFacturacion(idFacturacion, datosFacturacionData);
      return res.status(200).json({
        success: true,
        data: datosFacturacion,
        message: "Datos de facturación actualizados exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Eliminar datos de facturación
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const idFacturacion = parseInt(id, 10);
      if (isNaN(idFacturacion)) {
        return res.status(400).json({
          success: false,
          message: "El ID de facturación debe ser un número válido",
        });
      }
      const datosFacturacionEliminado = await datosFacturacionService.deleteDatosFacturacion(idFacturacion);
      return res.status(200).json({
        success: true,
        data: datosFacturacionEliminado,
        message: "Datos de facturación eliminados exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }
}

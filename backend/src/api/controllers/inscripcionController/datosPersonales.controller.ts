import { Request, Response, NextFunction } from "express";
import {
  CreateDatosPersonalesDto,
  UpdateDatosPersonalesDto,
} from "@/api/dtos/inscripcionDto/datosPersonales.dto";
import { DatosPersonalesService } from "@/api/services/inscripcionService/datosPersonales.service";

const datosPersonalesService = new DatosPersonalesService();

export class DatosPersonalesController {
  // Crear nuevos datos personales
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const datosPersonalesData: CreateDatosPersonalesDto = req.body;
      const datosPersonales =
        await datosPersonalesService.createDatosPersonales(datosPersonalesData);

      return res.status(201).json({
        success: true,
        data: datosPersonales,
        message: "Datos personales creados exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }
  //mostrar todos los datos personales
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query["page"] as string) || 1;
      const limit = parseInt(req.query["limit"] as string) || 10;
      const orderBy = (req.query["orderBy"] as string) || "apellidos";
      const order =
        (req.query["order"] as string)?.toUpperCase() === "DESC"
          ? "desc"
          : "asc";

      const { datosPersonales, total } =
        await datosPersonalesService.getAllDatosPersonales({
          page,
          limit,
          order,
          orderBy,
        });

      return res.status(200).json({
        success: true,
        data: datosPersonales,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: "Datos personales obtenidos exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  //obtener un dato personal por su id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datosPersonalesId = parseInt(id, 10);

      if (isNaN(datosPersonalesId)) {
        return res.status(400).json({
          success: false,
          message: "El ID de los datos personales debe ser un número válido",
        });
      }

      const datosPersonales =
        await datosPersonalesService.getDatosPersonalesById(datosPersonalesId);

      return res.status(200).json({
        success: true,
        data: datosPersonales,
        message: "Datos personales obtenidos exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  //Actualizar datos personales
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datosPersonalesId = parseInt(id, 10);

      if (isNaN(datosPersonalesId)) {
        return res.status(400).json({
          success: false,
          message: "El ID de los datos personales debe ser un número válido",
        });
      }

      const datosPersonalesData: UpdateDatosPersonalesDto = req.body;
      const datosPersonales =
        await datosPersonalesService.updateDatosPersonales(
          datosPersonalesId,
          datosPersonalesData
        );

      return res.status(200).json({
        success: true,
        data: datosPersonales,
        message: "Datos personales actualizados exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }
  //Eliminar datos personales
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datosPersonalesId = parseInt(id, 10);

      if (isNaN(datosPersonalesId)) {
        return res.status(400).json({
          success: false,
          message: "El ID de los datos personales debe ser un número válido",
        });
      }

      const datosPersonalesEliminados =
        await datosPersonalesService.deleteDatosPersonales(datosPersonalesId);

      return res.status(200).json({
        success: true,
        data: datosPersonalesEliminados,
        message: "Datos personales eliminados exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  //Buscar datos personales por ci o pasaporte
  async getByCiPasaporte(req: Request, res: Response, next: NextFunction) {
    try {
      const ciPasaporte = req.query['ciPasaporte'] as string;
      if (!ciPasaporte || typeof ciPasaporte !== 'string' || ciPasaporte.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "El ci o pasaporte es requerido",
        });
      }
      const datosPersonales = await datosPersonalesService.getByCiPasaporte(ciPasaporte);
      return res.status(200).json({
        success: true,
        data: datosPersonales,
        message: "Datos personales obtenidos exitosamente",
      });
    } catch(error) {
      return next(error);
    }
  }

}

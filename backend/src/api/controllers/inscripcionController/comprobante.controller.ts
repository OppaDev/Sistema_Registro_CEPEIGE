import { Request, Response, NextFunction } from "express";
import { ComprobanteService } from "@/api/services/inscripcionService/comprobante.service";
import { deleteFile } from "@/config/multer";
import { AppError, BadRequestError, NotFoundError } from "@/utils/errorTypes";

const comprobanteService = new ComprobanteService();

export class ComprobanteController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError(
          "No se ha subido ningún archivo de comprobante."
        );
      }

      const comprobanteData = {
        rutaComprobante: req.file.path,
        tipoArchivo: req.file.mimetype,
        nombreArchivo: req.file.filename,
      };

      const nuevoComprobante = await comprobanteService.createComprobante(
        comprobanteData
      );

      return res.status(201).json({
        success: true,
        data: nuevoComprobante,
        message: "Comprobante subido y creado exitosamente.",
      });
    } catch (error) {
      if (req.file && req.file.path) {
        const isMulterError =
          error instanceof AppError &&
          (error.message.includes("No se ha subido ningún archivo") ||
            error.message.includes("Tipo de archivo no permitido"));
        if (!isMulterError) {
          try {
            await deleteFile(req.file.path);
          } catch (deleteError) {
            console.error(
              "Error al intentar limpiar archivo subido tras fallo en controlador:",
              deleteError
            );
          }
        }
      }
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const idComprobante = parseInt(req.params["id"], 10);
      if (isNaN(idComprobante)) {
        throw new BadRequestError(
          "El ID del comprobante debe ser un número válido."
        );
      }
      const comprobante = await comprobanteService.getComprobanteById(
        idComprobante
      );
      if (!comprobante) {
        throw new NotFoundError(`Comprobante con ID ${idComprobante}`);
      }
      return res.status(200).json({
        success: true,
        data: comprobante,
        message: "Comprobante obtenido exitosamente.",
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const idComprobante = parseInt(req.params["id"], 10);
      if (isNaN(idComprobante)) {
        throw new BadRequestError(
          "El ID del comprobante debe ser un número válido."
        );
      }
      await comprobanteService.deleteComprobante(idComprobante);
      return res.status(200).json({
        success: true,
        message: "Comprobante eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query["page"] as string) || 1;
      const limit = parseInt(req.query["limit"] as string) || 10;

      const { comprobantes, total } =
        await comprobanteService.getAllComprobantes({ page, limit });

      return res.status(200).json({
        success: true,
        data: comprobantes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: "Comprobantes obtenidos exitosamente.",
      });
    } catch (error) {
      return next(error);
    }
  }
}

import { Request, Response, NextFunction } from "express";
import { InscripcionService } from "@/api/services/inscripcionService/inscripcion.service";
import { CreateInscripcionDto, UpdateInscripcionDto } from "@/api/dtos/inscripcionDto/inscripcion.dto";
import { BadRequestError } from "@/utils/errorTypes";

const inscripcionService = new InscripcionService();

export class InscripcionController {
  // Crear una nueva inscripción
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const inscripcionData: CreateInscripcionDto = req.body;
      const inscripcion = await inscripcionService.createInscripcion(inscripcionData);

      return res.status(201).json({
        success: true,
        data: inscripcion,
        message: "Inscripción creada exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Actualizar una inscripción existente
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const inscripcionId = parseInt(id, 10);

      if (isNaN(inscripcionId)) {
        throw new BadRequestError("El ID de la inscripción debe ser un número válido");
      }

      const inscripcionData: UpdateInscripcionDto = req.body;
      const inscripcion = await inscripcionService.updateInscripcion(inscripcionId, inscripcionData);

      return res.status(200).json({
        success: true,
        data: inscripcion,
        message: "Inscripción actualizada exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener todas las inscripciones con paginación
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query["page"] as string) || 1;
      const limit = parseInt(req.query["limit"] as string) || 10;
      const orderBy = (req.query["orderBy"] as string) || "fechaInscripcion";
      const order = (req.query["order"] as string)?.toUpperCase() === "DESC" ? "desc" : "asc";

      const { inscripciones, total } = await inscripcionService.getAllInscripciones({
        page,
        limit,
        orderBy,
        order,
      });

      return res.status(200).json({
        success: true,
        data: inscripciones,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: "Inscripciones obtenidas exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Obtener una inscripción por ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const inscripcionId = parseInt(id, 10);

      if (isNaN(inscripcionId)) {
        throw new BadRequestError("El ID de la inscripción debe ser un número válido");
      }

      const inscripcion = await inscripcionService.getInscripcionById(inscripcionId);

      return res.status(200).json({
        success: true,
        data: inscripcion,
        message: "Inscripción obtenida exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Eliminar una inscripción
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const inscripcionId = parseInt(id, 10);

      if (isNaN(inscripcionId)) {
        throw new BadRequestError("El ID de la inscripción debe ser un número válido");
      }

      await inscripcionService.deleteInscripcion(inscripcionId);

      return res.status(200).json({
        success: true,
        message: "Inscripción eliminada exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  }
}

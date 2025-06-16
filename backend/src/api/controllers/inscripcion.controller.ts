import { Request, Response, NextFunction } from "express";
import { InscripcionService } from "@/api/services/inscripcion.service";
import { CreateInscripcionDto, UpdateInscripcionDto } from "@/api/dtos/inscripcion.dto";
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
}

import { Router } from "express";
import { InscripcionController } from "@/api/controllers/inscripcion.controller";
import { validateDto } from "@/api/middlewares/validate.dto";
import { CreateInscripcionDto, UpdateInscripcionDto } from "@/api/dtos/inscripcion.dto";

const router = Router();
const inscripcionController = new InscripcionController();

// Rutas para inscripciones
router.post("/", validateDto(CreateInscripcionDto), inscripcionController.create);
router.put("/:id", validateDto(UpdateInscripcionDto), inscripcionController.update);
export default router;

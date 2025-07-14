import { Router } from "express";
import { InscripcionController } from "@/api/controllers/inscripcionController/inscripcion.controller";
import { validateDto } from "@/api/middlewares/validate.dto";
import { CreateInscripcionDto, UpdateInscripcionDto } from "@/api/dtos/inscripcionDto/inscripcion.dto";

const router = Router();
const inscripcionController = new InscripcionController();

// Rutas para inscripciones
router.post("/", validateDto(CreateInscripcionDto), inscripcionController.create);
router.get("/", inscripcionController.getAll);
router.get("/:id", inscripcionController.getById);
router.put("/:id", validateDto(UpdateInscripcionDto), inscripcionController.update);
router.delete("/:id", inscripcionController.delete);
export default router;

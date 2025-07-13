import { Router } from "express";
import { DatosFacturacionController } from "@/api/controllers/inscripcionController/datosFacturacion.controller";
import { validateDto } from "@/api/middlewares/validate.dto";
import { CreateDatosFacturacionDto, UpdateDatosFacturacionDto } from "@/api/dtos/inscripcionDto/datosFacturacion.dto";

const router = Router();
const datosFacturacionController = new DatosFacturacionController();

router.post("/", validateDto(CreateDatosFacturacionDto), datosFacturacionController.create);

router.get("/", datosFacturacionController.getAll);
router.get("/:id", datosFacturacionController.getById);

router.put("/:id", validateDto(UpdateDatosFacturacionDto), datosFacturacionController.update);

router.delete("/:id", datosFacturacionController.delete);

export default router;

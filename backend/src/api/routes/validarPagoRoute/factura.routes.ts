import { Router } from 'express';
import { FacturaController } from '@/api/controllers/validarPagoController/factura.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { CreateFacturaDto, UpdateFacturaDto } from '@/api/dtos/validarPagoDto/factura.dto';

const router = Router();
const facturaController = new FacturaController();

// Rutas principales
router.post('/', validateDto(CreateFacturaDto), facturaController.create);
router.put('/:id', validateDto(UpdateFacturaDto), facturaController.update);
router.get('/', facturaController.getAll);
router.get('/:id', facturaController.getById);
router.delete('/:id', facturaController.delete);

// Rutas específicas para búsquedas
router.get('/numero-factura/:numeroFactura', facturaController.getByNumeroFactura);
router.get('/numero-ingreso/:numeroIngreso', facturaController.getByNumeroIngreso);
router.get('/inscripcion/:idInscripcion', facturaController.getByInscripcionId);

// Ruta para verificar pago
router.patch('/:id/verificar-pago', facturaController.verificarPago);

export default router;
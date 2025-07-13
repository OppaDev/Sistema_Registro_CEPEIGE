import { Router } from 'express';
import { ComprobanteController } from '@/api/controllers/inscripcionController/comprobante.controller';
import { uploadComprobanteMiddleware } from '@/config/multer'; // Middleware de Multer

const router = Router();
const comprobanteController = new ComprobanteController();

// Ruta para subir un nuevo comprobante.
// 'comprobanteFile' es el nombre del campo en el form-data que contendrá el archivo.
router.post(
  '/',
  uploadComprobanteMiddleware.single('comprobanteFile'), // 'comprobanteFile' debe ser el name del input type="file"
  comprobanteController.create
);

// Obtener todos los comprobantes (con paginación)
router.get('/', comprobanteController.getAll);

// Obtener un comprobante por su ID
router.get('/:id', comprobanteController.getById);

// Eliminar un comprobante
router.delete('/:id', comprobanteController.delete);


export default router;
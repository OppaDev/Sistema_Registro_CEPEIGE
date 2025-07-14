import { Router } from 'express';
import { AuthController } from '@/api/controllers/authController/auth.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { LoginDto, RefreshTokenDto } from '@/api/dtos/authDto/auth.dto';

const router = Router();
const authController = new AuthController();

// Rutas públicas (no requieren autenticación)
router.post('/login', validateDto(LoginDto), authController.login);
router.post('/refresh', validateDto(RefreshTokenDto), authController.refresh);
router.post('/logout', authController.logout);

// Rutas protegidas (requieren autenticación)
router.use(authenticate); // Todas las rutas siguientes requieren autenticación

router.get('/profile', authController.getProfile);
router.get('/verify', authController.verifyToken);
router.get('/sessions', authController.getActiveSessions);
router.post('/logout-all', authController.logoutAll);

export default router;

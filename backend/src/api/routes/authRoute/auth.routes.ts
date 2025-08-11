import { Router } from 'express';
import { AuthController } from '@/api/controllers/authController/auth.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { authenticatedMiddleware } from '@/api/middlewares/role.middleware';
import { LoginDto, RefreshTokenDto } from '@/api/dtos/authDto/auth.dto';

const router = Router();
const authController = new AuthController();

// === ENDPOINTS PÚBLICOS (sin autenticación) ===
router.post('/login', validateDto(LoginDto), authController.login);
router.post('/refresh', validateDto(RefreshTokenDto), authController.refresh);
router.get('/ping', (_req, res) => res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() }));

// === ENDPOINTS AUTENTICADOS (todos los usuarios logueados) ===
router.post('/logout', authenticate, authenticatedMiddleware, authController.logout);
router.get('/profile', authenticate, authenticatedMiddleware, authController.getProfile);
router.get('/verify', authenticate, authenticatedMiddleware, authController.verifyToken);
router.get('/sessions', authenticate, authenticatedMiddleware, authController.getActiveSessions);
router.post('/logout-all', authenticate, authenticatedMiddleware, authController.logoutAll);

export default router;

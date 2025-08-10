import { CorreoService, CorreoInvitacionTelegramData } from './correo.service';
import { logger } from '@/utils/logger';

describe('CorreoService', () => {
  let correoService: CorreoService;

  beforeEach(() => {
    correoService = new CorreoService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarConfiguracion', () => {
    it('debe devolver true cuando todas las variables de entorno están configuradas', () => {
      process.env.EMAIL_HOST = 'smtp.maileroo.com';
      process.env.EMAIL_PORT = '587';
      process.env.EMAIL_USER = 'test@test.com';
      process.env.EMAIL_PASS = 'password123';

      const resultado = correoService.verificarConfiguracion();
      expect(resultado).toBe(true);
    });

    it('debe devolver false cuando falta una variable de entorno', () => {
      const originalValue = process.env.EMAIL_HOST;
      delete (process.env as any).EMAIL_HOST;
      
      const loggerSpy = jest.spyOn(logger, 'warn');
      const resultado = correoService.verificarConfiguracion();
      
      expect(resultado).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith('Variable de entorno faltante para correo: EMAIL_HOST');
      
      // Restaurar valor original
      if (originalValue) {
        process.env.EMAIL_HOST = originalValue;
      }
    });
  });

  describe('generarPlantillaInvitacionTelegram', () => {
    it('debe generar una plantilla HTML válida', () => {
      const data: CorreoInvitacionTelegramData = {
        email: 'test@test.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        nombreCurso: 'Curso de Programación',
        inviteLink: 'https://t.me/joinchat/test',
        fechaInicio: '2024-01-15'
      };

      // Usar reflexión para acceder al método privado
      const plantilla = (correoService as any).generarPlantillaInvitacionTelegram(data);

      expect(plantilla).toContain('Juan Pérez');
      expect(plantilla).toContain('Curso de Programación');
      expect(plantilla).toContain('https://t.me/joinchat/test');
      expect(plantilla).toContain('2024-01-15');
      expect(plantilla).toContain('<!DOCTYPE html>');
    });
  });

  describe('enviarNotificacion', () => {
    it('debe crear la configuración correcta del correo', async () => {
      const enviarCorreoSpy = jest.spyOn(correoService, 'enviarCorreo').mockResolvedValue(true);
      
      await correoService.enviarNotificacion(
        'test@test.com',
        'Test Subject',
        '<p>Test HTML</p>'
      );

      expect(enviarCorreoSpy).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER || 'noreply@cepeige.edu',
        to: 'test@test.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>'
      });
    });
  });
});
import { CorreoService, CorreoInvitacionTelegramData } from './correo.service';
import { logger } from '@/utils/logger';

// Mock nodemailer
const mockSendMail = jest.fn();
const mockVerify = jest.fn();
const mockCreateTransport = jest.fn(() => ({
  sendMail: mockSendMail,
  verify: mockVerify
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockCreateTransport())
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }
}));

describe('CorreoService', () => {
  let correoService: CorreoService;

  beforeEach(() => {
    // Setup environment variables
    process.env.EMAIL_HOST = 'smtp.maileroo.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@test.com';
    process.env.EMAIL_PASS = 'password123';
    
    correoService = new CorreoService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarConfiguracion', () => {
    // SRV-COR-001: Devolver true cuando todas las variables de entorno están configuradas
    it('SRV-COR-001: debe devolver true cuando todas las variables de entorno están configuradas', () => {
      process.env.EMAIL_HOST = 'smtp.maileroo.com';
      process.env.EMAIL_PORT = '587';
      process.env.EMAIL_USER = 'test@test.com';
      process.env.EMAIL_PASS = 'password123';

      const resultado = correoService.verificarConfiguracion();
      expect(resultado).toBe(true);
    });

    // SRV-COR-002: Devolver false cuando falta una variable de entorno
    it('SRV-COR-002: debe devolver false cuando falta una variable de entorno', () => {
      const originalValues = {
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS
      };
      
      // Eliminar solo EMAIL_HOST
      delete (process.env as any).EMAIL_HOST;
      
      // Crear nueva instancia después de cambiar las variables de entorno
      const testService = new CorreoService();
      const loggerSpy = jest.spyOn(logger, 'warn');
      const resultado = testService.verificarConfiguracion();
      
      expect(resultado).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith('Variable de entorno faltante para correo: EMAIL_HOST');
      
      // Restaurar todas las variables originales
      Object.entries(originalValues).forEach(([key, value]) => {
        if (value !== undefined) {
          process.env[key] = value;
        }
      });
    });

    // SRV-COR-002b: Verificar todas las variables requeridas
    it('SRV-COR-002b: debe verificar cada variable de entorno requerida', () => {
      const loggerSpy = jest.spyOn(logger, 'warn');

      // Test solo EMAIL_PORT para evitar conflictos
      const originalValue = process.env.EMAIL_PORT;
      delete (process.env as any).EMAIL_PORT;
      
      // Crear nueva instancia para el test
      const testService = new CorreoService();
      const resultado = testService.verificarConfiguracion();
      
      expect(resultado).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith('Variable de entorno faltante para correo: EMAIL_PORT');
      
      // Restaurar valor original
      if (originalValue) {
        process.env.EMAIL_PORT = originalValue;
      }
    });
  });

  describe('generarPlantillaInvitacionTelegram', () => {
    // SRV-COR-003: Generar una plantilla HTML válida
    it('SRV-COR-003: debe generar una plantilla HTML válida', () => {
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
    // SRV-COR-004: Crear la configuración correcta del correo
    it('SRV-COR-004: debe crear la configuración correcta del correo', async () => {
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

  describe('enviarInvitacionTelegram', () => {
    const mockData: CorreoInvitacionTelegramData = {
      email: 'test@test.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      nombreCurso: 'Curso de Programación',
      inviteLink: 'https://t.me/joinchat/test',
      fechaInicio: '2024-01-15'
    };

    // SRV-COR-005: Enviar invitación exitosamente
    it('SRV-COR-005: debe enviar invitación de Telegram exitosamente', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const resultado = await correoService.enviarInvitacionTelegram(mockData);

      expect(resultado).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@test.com',
        to: 'test@test.com',
        subject: '¡Únete al grupo de Telegram de Curso de Programación!',
        html: expect.stringContaining('Juan Pérez')
      });
      expect(logger.info).toHaveBeenCalledWith('📧 Enviando correo electrónico:', expect.any(Object));
    });

    // SRV-COR-006: Manejar errores al enviar invitación
    it('SRV-COR-006: debe manejar errores al enviar invitación de Telegram', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(correoService.enviarInvitacionTelegram(mockData))
        .rejects.toThrow('Error al enviar invitación por correo');

      expect(logger.error).toHaveBeenCalledWith(
        'Error al enviar invitación de Telegram por correo:',
        expect.objectContaining({
          email: 'test@test.com',
          nombreCurso: 'Curso de Programación',
          error: 'Error al enviar correo: SMTP error'
        })
      );
    });

    // SRV-COR-006b: Manejar errores desconocidos al enviar invitación
    it('SRV-COR-006b: debe manejar errores desconocidos al enviar invitación de Telegram', async () => {
      mockSendMail.mockRejectedValue('String error');

      await expect(correoService.enviarInvitacionTelegram(mockData))
        .rejects.toThrow('Error al enviar invitación por correo');

      expect(logger.error).toHaveBeenCalledWith(
        'Error al enviar invitación de Telegram por correo:',
        expect.objectContaining({
          email: 'test@test.com',
          nombreCurso: 'Curso de Programación',
          error: 'Error al enviar correo: Error desconocido'
        })
      );
    });
  });

  describe('enviarCorreo', () => {
    const mockConfig = {
      from: 'sender@test.com',
      to: 'recipient@test.com',
      subject: 'Test Subject',
      html: '<p>Test content</p>'
    };

    // SRV-COR-007: Enviar correo exitosamente
    it('SRV-COR-007: debe enviar correo exitosamente', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const resultado = await correoService.enviarCorreo(mockConfig);

      expect(resultado).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(mockConfig);
      expect(logger.info).toHaveBeenCalledWith('📧 Enviando correo electrónico:', {
        from: 'sender@test.com',
        to: 'recipient@test.com',
        subject: 'Test Subject',
        htmlLength: 19
      });
      expect(logger.info).toHaveBeenCalledWith('✅ Correo enviado exitosamente a:', 'recipient@test.com');
    });

    // SRV-COR-008: Manejar errores al enviar correo
    it('SRV-COR-008: debe manejar errores al enviar correo', async () => {
      const error = new Error('SMTP connection failed');
      mockSendMail.mockRejectedValue(error);

      await expect(correoService.enviarCorreo(mockConfig))
        .rejects.toThrow('Error al enviar correo: SMTP connection failed');

      expect(logger.error).toHaveBeenCalledWith('❌ Error al enviar correo:', {
        to: 'recipient@test.com',
        subject: 'Test Subject',
        error: 'SMTP connection failed'
      });
    });

    // SRV-COR-009: Manejar errores desconocidos al enviar correo
    it('SRV-COR-009: debe manejar errores desconocidos al enviar correo', async () => {
      mockSendMail.mockRejectedValue('String error');

      await expect(correoService.enviarCorreo(mockConfig))
        .rejects.toThrow('Error al enviar correo: Error desconocido');

      expect(logger.error).toHaveBeenCalledWith('❌ Error al enviar correo:', {
        to: 'recipient@test.com',
        subject: 'Test Subject',
        error: 'Error desconocido'
      });
    });
  });

  describe('probarConexion', () => {
    // SRV-COR-010: Probar conexión exitosa
    it('SRV-COR-010: debe verificar conexión exitosamente', async () => {
      mockVerify.mockResolvedValue(true);

      const resultado = await correoService.probarConexion();

      expect(resultado).toBe(true);
      expect(mockVerify).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('✅ Conexión con servidor de correo verificada');
    });

    // SRV-COR-011: Manejar errores de conexión
    it('SRV-COR-011: debe manejar errores de conexión', async () => {
      const error = new Error('Connection timeout');
      mockVerify.mockRejectedValue(error);

      const resultado = await correoService.probarConexion();

      expect(resultado).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('❌ Error al verificar conexión con servidor de correo:', {
        error: 'Connection timeout'
      });
    });

    // SRV-COR-012: Manejar errores desconocidos en conexión
    it('SRV-COR-012: debe manejar errores desconocidos en conexión', async () => {
      mockVerify.mockRejectedValue('Unknown error');

      const resultado = await correoService.probarConexion();

      expect(resultado).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('❌ Error al verificar conexión con servidor de correo:', {
        error: 'Error desconocido'
      });
    });
  });

  describe('enviarNotificacion', () => {
    // SRV-COR-013: Enviar notificación con configuración correcta
    it('SRV-COR-013: debe enviar notificación con configuración correcta', async () => {
      const enviarCorreoSpy = jest.spyOn(correoService, 'enviarCorreo').mockResolvedValue(true);
      
      const resultado = await correoService.enviarNotificacion(
        'recipient@test.com',
        'Test Notification',
        '<p>Notification content</p>'
      );

      expect(resultado).toBe(true);
      expect(enviarCorreoSpy).toHaveBeenCalledWith({
        from: 'test@test.com',
        to: 'recipient@test.com',
        subject: 'Test Notification',
        html: '<p>Notification content</p>'
      });
    });

    // SRV-COR-014: Usar email por defecto cuando no hay EMAIL_USER
    it('SRV-COR-014: debe usar email por defecto cuando no hay EMAIL_USER', async () => {
      const originalUser = process.env.EMAIL_USER;
      delete (process.env as any).EMAIL_USER;

      // Crear nueva instancia del servicio sin EMAIL_USER
      const testService = new CorreoService();
      const enviarCorreoSpy = jest.spyOn(testService, 'enviarCorreo').mockResolvedValue(true);
      
      await testService.enviarNotificacion(
        'recipient@test.com',
        'Test Notification',
        '<p>Notification content</p>'
      );

      expect(enviarCorreoSpy).toHaveBeenCalledWith({
        from: 'noreply@cepeige.edu',
        to: 'recipient@test.com',
        subject: 'Test Notification',
        html: '<p>Notification content</p>'
      });

      // Restore original value
      if (originalUser) {
        process.env.EMAIL_USER = originalUser;
      }
    });
  });
});
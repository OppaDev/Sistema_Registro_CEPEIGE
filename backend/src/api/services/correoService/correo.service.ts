import { logger } from "@/utils/logger";
import { AppError } from "@/utils/errorTypes";
import nodemailer from 'nodemailer';

export interface CorreoConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface CorreoInvitacionTelegramData {
  email: string;
  nombre: string;
  apellido: string;
  nombreCurso: string;
  inviteLink: string;
  fechaInicio: string;
}

export class CorreoService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env['EMAIL_HOST'] || 'smtp.maileroo.com',
      port: parseInt(process.env['EMAIL_PORT'] || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASS']
      }
    });
  }

  /**
   * Enviar correo de invitación a grupo de Telegram
   * @param data - Datos para generar el correo
   * @returns Promise<boolean> - true si se envió exitosamente
   */
  async enviarInvitacionTelegram(data: CorreoInvitacionTelegramData): Promise<boolean> {
    try {
      const correoConfig: CorreoConfig = {
        from: process.env['EMAIL_USER'] || 'noreply@cepeige.edu',
        to: data.email,
        subject: `¡Únete al grupo de Telegram de ${data.nombreCurso}!`,
        html: this.generarPlantillaInvitacionTelegram(data)
      };

      return await this.enviarCorreo(correoConfig);

    } catch (error) {
      logger.error('Error al enviar invitación de Telegram por correo:', {
        email: data.email,
        nombreCurso: data.nombreCurso,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw new AppError('Error al enviar invitación por correo', 500);
    }
  }

  /**
   * Enviar correo genérico
   * @param config - Configuración del correo
   * @returns Promise<boolean> - true si se envió exitosamente
   */
  async enviarCorreo(config: CorreoConfig): Promise<boolean> {
    try {
      logger.info('📧 Enviando correo electrónico:', {
        from: config.from,
        to: config.to,
        subject: config.subject,
        htmlLength: config.html.length
      });

      await this.transporter.sendMail({
        from: config.from,
        to: config.to,
        subject: config.subject,
        html: config.html
      });

      logger.info('✅ Correo enviado exitosamente a:', config.to);
      return true;

    } catch (error) {
      logger.error('❌ Error al enviar correo:', {
        to: config.to,
        subject: config.subject,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw new AppError(`Error al enviar correo: ${error instanceof Error ? error.message : 'Error desconocido'}`, 500);
    }
  }

  /**
   * Generar plantilla HTML para invitación a Telegram
   * @param data - Datos para la plantilla
   * @returns string - HTML del correo
   */
  private generarPlantillaInvitacionTelegram(data: CorreoInvitacionTelegramData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación al grupo de Telegram</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 ¡Felicidades!</h1>
            <h2 style="margin: 10px 0 0 0; font-weight: normal; font-size: 18px; opacity: 0.9;">Tu matrícula ha sido confirmada</h2>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; margin-bottom: 25px; color: #2c3e50;">
                Hola <strong>${data.nombre} ${data.apellido}</strong>,
            </p>
            
            <p style="margin-bottom: 25px; font-size: 16px; color: #555;">
                Tu matrícula para el curso <strong style="color: #667eea;">${data.nombreCurso}</strong> ha sido confirmada exitosamente.
            </p>
            
            <!-- Telegram Invitation Card -->
            <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%); padding: 25px; border-radius: 10px; border-left: 5px solid #0088cc; margin: 30px 0;">
                <div style="text-align: center;">
                    <h3 style="margin: 0 0 15px 0; font-weight: bold; color: #0088cc; font-size: 20px;">
                        📱 ¡Únete a nuestro grupo de Telegram!
                    </h3>
                    <p style="margin: 0 0 20px 0; color: #555; font-size: 15px;">
                        Forma parte de la comunidad del curso y mantente conectado con tus compañeros e instructores.
                    </p>
                    <div style="margin: 25px 0;">
                        <a href="${data.inviteLink}" 
                           style="background: #0088cc; color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: bold; font-size: 16px; transition: background-color 0.3s; box-shadow: 0 3px 6px rgba(0, 136, 204, 0.3);">
                            🚀 Unirse al grupo
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Course Info -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e9ecef;">
                <h4 style="margin: 0 0 10px 0; color: #495057; font-size: 16px;">📋 Información del curso:</h4>
                <p style="margin: 5px 0; font-size: 14px; color: #6c757d;">
                    <strong>📅 Fecha de inicio:</strong> ${data.fechaInicio}
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #6c757d;">
                    <strong>🎓 Curso:</strong> ${data.nombreCurso}
                </p>
            </div>

            <!-- Instructions -->
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 25px 0;">
                <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 14px;">💡 Instrucciones:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 13px;">
                    <li>Haz clic en "Unirse al grupo" para acceder directamente</li>
                    <li>Si no tienes Telegram, descárgalo desde telegram.org</li>
                    <li>El enlace estará disponible hasta el inicio del curso</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e9ecef; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d;">
                Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #495057;">
                CEPEIGE - Centro de Estudios
            </p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #adb5bd;">
                Este correo fue enviado automáticamente, por favor no responder.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }


  /**
   * Verificar configuración del servicio de correo
   * @returns boolean - true si está configurado
   */
  verificarConfiguracion(): boolean {
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        logger.warn(`Variable de entorno faltante para correo: ${envVar}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Probar conexión con el servidor de correo
   * @returns Promise<boolean> - true si la conexión es exitosa
   */
  async probarConexion(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('✅ Conexión con servidor de correo verificada');
      return true;
    } catch (error) {
      logger.error('❌ Error al verificar conexión con servidor de correo:', {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Enviar correo de notificación genérico
   * @param to - Email destinatario
   * @param subject - Asunto del correo
   * @param html - Contenido HTML
   * @returns Promise<boolean> - true si se envió exitosamente
   */
  async enviarNotificacion(to: string, subject: string, html: string): Promise<boolean> {
    const config: CorreoConfig = {
      from: process.env['EMAIL_USER'] || 'noreply@cepeige.edu',
      to,
      subject,
      html
    };

    return await this.enviarCorreo(config);
  }
}
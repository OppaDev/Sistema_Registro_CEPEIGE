import { TelegramClient, Api } from 'telegram';
import bigInt from 'big-integer';
import { StringSession } from 'telegram/sessions';
import { AppError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';
import type { Curso } from '@prisma/client';

interface TelegramCredentials {
  apiId: number;
  apiHash: string;
  sessionString: string;
}

interface CreateGroupResponse {
  groupId: number;
  groupTitle: string;
  inviteLink: string;
}

class GrupoCursoTelegramService {
  private client: TelegramClient | null = null;
  private credentials: TelegramCredentials | null = null;

  constructor() {
    this.initializeCredentials();
  }

  private initializeCredentials(): void {
    const apiId = process.env["TELEGRAM_API_ID"];
    const apiHash = process.env["TELEGRAM_API_HASH"];
    const sessionString = process.env["TELEGRAM_SESSION_STRING"];

    if (!apiId || !apiHash || !sessionString) {
      logger.warn('Credenciales de Telegram no configuradas. TELEGRAM_API_ID, TELEGRAM_API_HASH y TELEGRAM_SESSION_STRING son requeridos.');
      return;
    }

    this.credentials = {
      apiId: parseInt(apiId),
      apiHash,
      sessionString
    };

    logger.info('Credenciales de Telegram configuradas correctamente');
  }

  private async initializeClient(): Promise<void> {
    if (this.client) {
      return;
    }

    if (!this.credentials) {
      throw new AppError('Credenciales de Telegram no configuradas', 500);
    }

    try {
      // Create session from string
      const session = new StringSession(this.credentials.sessionString);
      
      // Initialize Telegram client
      this.client = new TelegramClient(session, this.credentials.apiId, this.credentials.apiHash, {
        connectionRetries: 5,
      });
      
      // Connect to Telegram (using existing session)
      await this.client.connect();
      
      // Test the connection
      const me = await this.client.getMe();
      logger.info(`Cliente de Telegram conectado: ${me.firstName || ''} ${me.lastName || ''} (@${me.username || 'sin_username'})`);
      
    } catch (error) {
      logger.error('Error al inicializar cliente de Telegram:', error);
      throw new AppError('Error al conectar con Telegram', 500);
    }
  }

  async crearGrupoParaCurso(curso: Curso): Promise<CreateGroupResponse> {
    try {
      await this.initializeClient();
      
      if (!this.client) {
        throw new AppError('Cliente de Telegram no inicializado', 500);
      }

      logger.info(`Creando grupo de Telegram para curso: ${curso.nombreCortoCurso}`);

      // Generate group title and description
      const groupTitle = this.generateGroupTitle(curso);
      const groupDescription = this.generateGroupDescription(curso);

      // Create the group using Telegram Client API
      // This allows creating actual groups/supergroups with user account
      const result = await this.client.invoke(
        new Api.messages.CreateChat({
          title: groupTitle,
          users: [], // Start with empty group
        })
      );

      // Basic logging for debugging
      logger.debug('CreateChat completed, parsing response...');

      let groupId: number;
      let inviteLink: string = '';

      // More flexible parsing - try different response structures
      let chat: any = null;
      
      if ('chats' in result && Array.isArray(result.chats) && result.chats.length > 0) {
        chat = result.chats[0];
        groupId = Number(chat.id);
      } else if ('updates' in result) {
        const updatesObj = (result as any).updates;
        
        // Check if updates object has chats array (main target)
        if ('chats' in updatesObj && Array.isArray(updatesObj.chats) && updatesObj.chats.length > 0) {
          chat = updatesObj.chats[0];
          groupId = Number(chat.id);
        } 
        // Fallback: Check if updates has an updates array
        else if ('updates' in updatesObj && Array.isArray(updatesObj.updates)) {
          const updates = updatesObj.updates;
          
          for (const update of updates) {
            if ('message' in update && 'peerId' in update.message) {
              const peerId = update.message.peerId;
              if ('chatId' in peerId) {
                groupId = Number(peerId.chatId);
                break;
              }
            } else if ('participants' in update && 'chatId' in update.participants) {
              groupId = Number(update.participants.chatId);
              break;
            } else if ('peer' in update && 'chatId' in update.peer) {
              groupId = Number(update.peer.chatId);
              break;
            }
          }
        }
      } else if ('peer' in result) {
        // Direct peer response
        const peer = (result as any).peer;
        if ('chat_id' in peer) {
          groupId = Number(peer.chat_id);
        }
      }

      // If we have a groupId from any parsing method, proceed
      if (groupId! && !isNaN(groupId)) {
        logger.info('Successfully extracted group ID:', groupId);

        // Set group description
        try {
          await this.client.invoke(
            new Api.messages.EditChatAbout({
              peer: new Api.InputPeerChat({
                chatId: bigInt(groupId.toString())
              }),
              about: groupDescription
            })
          );
        } catch (descError) {
          logger.warn('No se pudo establecer la descripción del grupo:', descError);
        }

        // Create invite link
        try {
          const linkResult = await this.client.invoke(
            new Api.messages.ExportChatInvite({
              peer: new Api.InputPeerChat({
                chatId: bigInt(groupId.toString())
              }),
              title: `Invitación a ${curso.nombreCortoCurso}`,
              usageLimit: 200
            })
          );
          
          if ('link' in linkResult) {
            inviteLink = linkResult.link;
          }
        } catch (linkError) {
          logger.warn('No se pudo crear enlace de invitación:', linkError);
        }

        logger.info(`Grupo de Telegram creado exitosamente para curso ${curso.nombreCortoCurso}`, {
          groupId,
          groupTitle,
          inviteLink
        });

        return {
          groupId,
          groupTitle,
          inviteLink
        };
      }

      // Additional fallback - try to parse chat from the original logic
      if (chat && 'id' in chat) {
        groupId = Number(chat.id);
        logger.info('Fallback: Found group ID in chat object:', groupId);
        
        // Same processing as above...
        try {
          await this.client.invoke(
            new Api.messages.EditChatAbout({
              peer: new Api.InputPeerChat({
                chatId: bigInt(groupId.toString())
              }),
              about: groupDescription
            })
          );
        } catch (descError) {
          logger.warn('No se pudo establecer la descripción del grupo:', descError);
        }

        try {
          const linkResult = await this.client.invoke(
            new Api.messages.ExportChatInvite({
              peer: new Api.InputPeerChat({
                chatId: bigInt(groupId.toString())
              }),
              title: `Invitación a ${curso.nombreCortoCurso}`,
              usageLimit: 200
            })
          );
          
          if ('link' in linkResult) {
            inviteLink = linkResult.link;
          }
        } catch (linkError) {
          logger.warn('No se pudo crear enlace de invitación:', linkError);
        }

        return {
          groupId,
          groupTitle,
          inviteLink
        };
      }

      logger.error('No se pudo extraer group ID de la respuesta');
      throw new AppError('Respuesta inválida al crear grupo de Telegram', 500);

    } catch (error) {
      logger.error('Error al crear grupo de Telegram:', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        curso: curso.nombreCortoCurso
      });

      // Si ya es un AppError, re-lanzarlo sin modificar
      if (error instanceof AppError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new AppError(`Error al crear grupo de Telegram: ${errorMessage}`, 500);
    }
  }

  async obtenerInfoGrupo(groupId: string | number): Promise<any> {
    try {
      await this.initializeClient();
      
      if (!this.client) {
        throw new AppError('Cliente de Telegram no inicializado', 500);
      }

      const result = await this.client.invoke(
        new Api.messages.GetChats({
          id: [bigInt(groupId.toString())]
        })
      );

      if (result.chats && result.chats.length > 0) {
        return result.chats[0];
      }

      return null;

    } catch (error) {
      logger.error('Error al obtener información del grupo:', error);
      throw new AppError('Error al obtener información del grupo de Telegram', 500);
    }
  }

  async crearEnlaceInvitacion(groupId: string | number, nombreCurso: string): Promise<string> {
    try {
      await this.initializeClient();
      
      if (!this.client) {
        throw new AppError('Cliente de Telegram no inicializado', 500);
      }

      const result = await this.client.invoke(
        new Api.messages.ExportChatInvite({
          peer: bigInt(groupId.toString()),
          title: `Invitación a ${nombreCurso}`,
          usageLimit: 200
        })
      );

      if ('link' in result) {
        logger.info(`Enlace de invitación creado para grupo ${groupId}: ${result.link}`);
        return result.link;
      }

      throw new AppError('No se pudo crear el enlace de invitación', 500);

    } catch (error) {
      logger.error('Error al crear enlace de invitación:', error);
      throw new AppError('Error al crear enlace de invitación', 500);
    }
  }

  async eliminarGrupo(groupId: string | number): Promise<boolean> {
    try {
      await this.initializeClient();
      
      if (!this.client) {
        throw new AppError('Cliente de Telegram no inicializado', 500);
      }

      // Delete the group (only works if user is admin/creator)
      await this.client.invoke(
        new Api.messages.DeleteChat({
          chatId: bigInt(groupId.toString())
        })
      );
      
      logger.info(`Grupo ${groupId} eliminado exitosamente`);
      return true;

    } catch (error) {
      logger.error('Error al eliminar grupo:', error);
      // If can't delete, try to leave the group
      try {
        if (!this.client) {
          throw new AppError('Cliente de Telegram no inicializado', 500);
        }
        const me = await this.client.getMe();
        await this.client.invoke(
          new Api.messages.DeleteChatUser({
            chatId: bigInt(groupId.toString()),
            userId: me.id
          })
        );
        logger.info(`Salió del grupo ${groupId}`);
        return true;
      } catch (leaveError) {
        logger.error('Error al salir del grupo:', leaveError);
        throw new AppError('Error al eliminar/salir del grupo de Telegram', 500);
      }
    }
  }

  private generateGroupTitle(curso: Curso): string {
    const fechaInicio = curso.fechaInicioCurso.toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric'
    });
    
    return `${curso.nombreCortoCurso} - ${fechaInicio}`;
  }

  private generateGroupDescription(curso: Curso): string {
    const fechaInicio = curso.fechaInicioCurso.toLocaleDateString('es-ES');
    const fechaFin = curso.fechaFinCurso.toLocaleDateString('es-ES');
    
    // Truncate description to fit Telegram's limit (~255 chars)
    const maxDescLength = 50;
    const shortDesc = curso.descripcionCurso.length > maxDescLength 
      ? curso.descripcionCurso.substring(0, maxDescLength) + '...'
      : curso.descripcionCurso;
    
    return `
📚 **${curso.nombreCurso}**

📝 ${shortDesc}
🎓 ${curso.modalidadCurso}
📅 ${fechaInicio} - ${fechaFin}
💰 $${curso.valorCurso}

¡Bienvenidos al grupo oficial! 🎉
    `.trim();
  }

  async verificarConexion(): Promise<boolean> {
    try {
      await this.initializeClient();
      
      if (!this.client) {
        return false;
      }

      await this.client.getMe();
      return true;

    } catch (error) {
      logger.error('Error al verificar conexión con Telegram:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.disconnect();
        this.client = null;
        logger.info('Cliente de Telegram desconectado');
      }
    } catch (error) {
      logger.error('Error al desconectar cliente de Telegram:', error);
    }
  }
}

export { GrupoCursoTelegramService };
export const grupoCursoTelegramService = new GrupoCursoTelegramService();
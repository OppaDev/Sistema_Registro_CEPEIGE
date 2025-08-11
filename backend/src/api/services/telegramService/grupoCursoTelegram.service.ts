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
      const client = this.requireClient();

      logger.info(`Creando grupo de Telegram para curso: ${curso.nombreCortoCurso}`);

      // Generate group title and description
      const groupTitle = this.generateGroupTitle(curso);
      const groupDescription = this.generateGroupDescription(curso);

      // Crear chat y extraer ID con lógica robusta
      const { groupId, chat } = await this.crearChatYObtenerId(client, groupTitle);

      if (!groupId || isNaN(groupId)) {
        // Fallback: intentar con chat.id si existe
        if (chat && 'id' in chat) {
          const fallbackId = Number(chat.id);
          logger.info('Fallback: Found group ID in chat object:', fallbackId);
          const inviteLink = await this.crearEnlazarDescripcionYLink(client, fallbackId, groupDescription, curso.nombreCortoCurso);
          return { groupId: fallbackId, groupTitle, inviteLink };
        }
        logger.error('No se pudo extraer group ID de la respuesta');
        throw new AppError('Respuesta inválida al crear grupo de Telegram', 500);
      }

      // Establecer descripción y crear enlace de invitación de forma segura
      const inviteLink = await this.crearEnlazarDescripcionYLink(client, groupId, groupDescription, curso.nombreCortoCurso);

      logger.info(`Grupo de Telegram creado exitosamente para curso ${curso.nombreCortoCurso}`, {
        groupId,
        groupTitle,
        inviteLink,
      });

      return { groupId, groupTitle, inviteLink };

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

  // Helpers privados para reducir complejidad
  private requireClient(): TelegramClient {
    if (!this.client) {
      throw new AppError('Cliente de Telegram no inicializado', 500);
    }
    return this.client;
  }

  private async crearChatYObtenerId(client: TelegramClient, groupTitle: string): Promise<{ groupId?: number; chat?: any }> {
    // Create the group using Telegram Client API
    const result = await client.invoke(
      new Api.messages.CreateChat({ title: groupTitle, users: [] })
    );
    logger.debug('CreateChat completed, parsing response...');
    return this.parseGroupIdFromResult(result);
  }

  private parseGroupIdFromResult(result: any): { groupId?: number; chat?: any } {
    // 1) Intentar extraer desde un array de chats directo
    const fromChats = this.extractFromChatsArray(result);
    if (fromChats.groupId || fromChats.chat) return fromChats;

    // 2) Intentar extraer desde el objeto updates
    const fromUpdates = this.extractFromUpdates(result);
    if (fromUpdates.groupId || fromUpdates.chat) return fromUpdates;

    // 3) Intentar extraer desde un peer plano
    const fromPeer = this.extractFromPeer(result);
    if (fromPeer.groupId) return fromPeer;

    // 4) Si nada funcionó, devolver chat si existe para posibles fallbacks del caller
    return { chat: (result && (result as any).chats && (result as any).chats[0]) || undefined };
  }

  private extractFromChatsArray(result: any): { groupId?: number; chat?: any } {
    if ('chats' in result && Array.isArray(result.chats) && result.chats.length > 0) {
      const chat = result.chats[0];
      return { groupId: Number(chat.id), chat };
    }
    return {};
  }

  private extractFromUpdates(result: any): { groupId?: number; chat?: any } {
    if (!('updates' in result)) return {};
    const updatesObj = (result as any).updates;

    // updates.chats
    if ('chats' in updatesObj && Array.isArray(updatesObj.chats) && updatesObj.chats.length > 0) {
      const chat = updatesObj.chats[0];
      return { groupId: Number(chat.id), chat };
    }

    // updates.updates
    if ('updates' in updatesObj && Array.isArray(updatesObj.updates)) {
      const id = this.extractGroupIdFromUpdatesArray(updatesObj.updates);
      if (id) return { groupId: id };
    }
    return {};
  }

  private extractGroupIdFromUpdatesArray(updates: any[]): number | undefined {
    for (const update of updates) {
      if ('message' in update && 'peerId' in update.message) {
        const peerId = update.message.peerId;
        if ('chatId' in peerId) return Number(peerId.chatId);
      }
      if ('participants' in update && 'chatId' in update.participants) {
        return Number(update.participants.chatId);
      }
      if ('peer' in update && 'chatId' in update.peer) {
        return Number(update.peer.chatId);
      }
    }
    return undefined;
  }

  private extractFromPeer(result: any): { groupId?: number } {
    if ('peer' in result) {
      const peer = (result as any).peer;
      if ('chat_id' in peer) return { groupId: Number(peer.chat_id) };
    }
    return {};
  }

  private async crearEnlazarDescripcionYLink(
    client: TelegramClient,
    groupId: number,
    groupDescription: string,
    nombreCortoCurso: string
  ): Promise<string> {
    await this.setGroupDescriptionSafe(client, groupId, groupDescription);
    const inviteLink = await this.exportInviteLinkSafe(client, groupId, nombreCortoCurso);
    return inviteLink;
  }

  private async setGroupDescriptionSafe(client: TelegramClient, groupId: number, description: string): Promise<void> {
    try {
      await client.invoke(
        new Api.messages.EditChatAbout({
          peer: new Api.InputPeerChat({ chatId: bigInt(groupId.toString()) }),
          about: description,
        })
      );
    } catch (e) {
      logger.warn('No se pudo establecer la descripción del grupo:', e);
    }
  }

  private async exportInviteLinkSafe(client: TelegramClient, groupId: number, nombreCortoCurso: string): Promise<string> {
    try {
      const linkResult = await client.invoke(
        new Api.messages.ExportChatInvite({
          peer: new Api.InputPeerChat({ chatId: bigInt(groupId.toString()) }),
          title: `Invitación a ${nombreCortoCurso}`,
          usageLimit: 200,
        })
      );
      if ('link' in linkResult) return linkResult.link as string;
    } catch (e) {
      logger.warn('No se pudo crear enlace de invitación:', e);
    }
    return '';
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
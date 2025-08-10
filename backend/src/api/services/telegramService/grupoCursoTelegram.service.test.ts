// Mock de Telegram Client
const mockInvoke = jest.fn();
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

// Mock de TelegramClient
const mockTelegramClient = {
  invoke: mockInvoke,
  connect: mockConnect,
  disconnect: mockDisconnect,
  getMe: jest.fn(),
  connected: true
};

jest.mock('telegram', () => ({
  TelegramClient: jest.fn().mockImplementation(() => mockTelegramClient),
  Api: {
    messages: {
      CreateChat: jest.fn().mockImplementation(({ title, users }) => ({
        className: 'CreateChat',
        title,
        users
      }))
    },
    channels: {
      ExportInvite: jest.fn().mockImplementation(({ channel }) => ({
        className: 'ExportInvite', 
        channel
      }))
    }
  }
}));

jest.mock('telegram/sessions', () => ({
  StringSession: jest.fn().mockImplementation((sessionString) => ({
    sessionString
  }))
}));

jest.mock('big-integer', () => jest.fn());

// Mock del logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { GrupoCursoTelegramService } from './grupoCursoTelegram.service';
import { AppError } from '@/utils/errorTypes';
import { Decimal } from '@prisma/client/runtime/library';
import type { Curso } from '@prisma/client';
import bigInt from 'big-integer';

describe('GrupoCursoTelegramService', () => {
  let telegramService: GrupoCursoTelegramService;

  const mockCurso: Curso = {
    idCurso: 1,
    nombreCortoCurso: 'JS-2024',
    nombreCurso: 'JavaScript Básico',
    modalidadCurso: 'Virtual',
    descripcionCurso: 'Curso de JavaScript desde cero',
    valorCurso: new Decimal(299.99),
    fechaInicioCurso: new Date('2025-01-15'),
    fechaFinCurso: new Date('2025-03-15'),
  };

  beforeEach(() => {
    // Setup environment variables
    process.env['TELEGRAM_API_ID'] = '12345';
    process.env['TELEGRAM_API_HASH'] = 'test-hash';
    process.env['TELEGRAM_SESSION_STRING'] = 'test-session-string';
    
    telegramService = new GrupoCursoTelegramService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env['TELEGRAM_API_ID'];
    delete process.env['TELEGRAM_API_HASH'];
    delete process.env['TELEGRAM_SESSION_STRING'];
  });

  describe('crearGrupoParaCurso', () => {
    // SRV-INT-030: Crear grupo de Telegram exitosamente
    it('SRV-INT-030: debe crear un grupo de Telegram para el curso exitosamente', async () => {
      // Arrange
      const mockCreateChatResponse = {
        className: 'messages.Chat',
        chat: {
          id: bigInt('-123456789'),
          title: 'Curso: JavaScript Básico',
        },
        users: []
      };

      const mockInviteResponse = {
        className: 'messages.ExportedChatInvite',
        link: 'https://t.me/joinchat/test123456'
      };

      mockConnect.mockResolvedValue(undefined);
      mockInvoke
        .mockResolvedValueOnce(mockCreateChatResponse) // Primera llamada: crear grupo
        .mockResolvedValueOnce(mockInviteResponse);    // Segunda llamada: exportar enlace

      // Act
      const result = await telegramService.crearGrupoParaCurso(mockCurso);

      // Assert
      expect(result).toEqual({
        groupId: -123456789,
        groupTitle: 'Curso: JavaScript Básico',
        inviteLink: 'https://t.me/joinchat/test123456'
      });

      expect(mockConnect).toHaveBeenCalled();
      expect(mockInvoke).toHaveBeenCalledTimes(2);
    });

    // SRV-INT-031: Manejar error al crear grupo
    it('SRV-INT-031: debe manejar error al crear grupo de Telegram', async () => {
      // Arrange
      mockConnect.mockResolvedValue(undefined);
      mockInvoke.mockRejectedValue(new Error('Telegram API error'));

      // Act & Assert
      await expect(telegramService.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow(AppError);
      await expect(telegramService.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow('Error al crear grupo de Telegram: Telegram API error');
    });

    // SRV-INT-032: Manejar error de conexión
    it('SRV-INT-032: debe manejar error de conexión con Telegram', async () => {
      // Arrange
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      // Act & Assert
      await expect(telegramService.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow(AppError);
      await expect(telegramService.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow('Error al crear grupo de Telegram: Connection failed');
    });

    // SRV-INT-033: Manejar credenciales faltantes
    it('SRV-INT-033: debe manejar credenciales de Telegram faltantes', async () => {
      // Arrange - Crear instancia sin credenciales
      delete process.env['TELEGRAM_API_ID'];
      const serviceWithoutCredentials = new GrupoCursoTelegramService();

      // Act & Assert
      await expect(serviceWithoutCredentials.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow(AppError);
      await expect(serviceWithoutCredentials.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow('Credenciales de Telegram no configuradas');
    });

    // SRV-INT-034: Manejar respuesta inválida al crear grupo
    it('SRV-INT-034: debe manejar respuesta inválida al crear grupo', async () => {
      // Arrange
      const mockInvalidResponse = {
        className: 'messages.InvalidResponse'
      };

      mockConnect.mockResolvedValue(undefined);
      mockInvoke.mockResolvedValue(mockInvalidResponse);

      // Act & Assert
      await expect(telegramService.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow(AppError);
      await expect(telegramService.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow('Respuesta inválida al crear grupo de Telegram');
    });

    // SRV-INT-035: Manejar error al exportar enlace de invitación
    it('SRV-INT-035: debe manejar error al exportar enlace de invitación', async () => {
      // Arrange
      const mockCreateChatResponse = {
        className: 'messages.Chat',
        chat: {
          id: bigInt('-123456789'),
          title: 'Curso: JavaScript Básico',
        },
        users: []
      };

      mockConnect.mockResolvedValue(undefined);
      mockInvoke
        .mockResolvedValueOnce(mockCreateChatResponse) // Crear grupo OK
        .mockRejectedValueOnce(new Error('Export invite failed')); // Exportar enlace FAIL

      // Act & Assert
      await expect(telegramService.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow(AppError);
      await expect(telegramService.crearGrupoParaCurso(mockCurso))
        .rejects.toThrow('Error al crear grupo de Telegram: Export invite failed');
    });
  });

  describe('obtenerInfoGrupo', () => {
    // SRV-INT-036: Obtener información del grupo exitosamente
    it('SRV-INT-036: debe obtener información del grupo exitosamente', async () => {
      // Arrange
      const groupId = -123456789;
      const mockGroupInfo = {
        id: groupId,
        title: 'Curso: JavaScript Básico',
        participantsCount: 5
      };

      const mockResponse = {
        chats: [mockGroupInfo]
      };

      mockConnect.mockResolvedValue(undefined);
      mockInvoke.mockResolvedValue(mockResponse);

      // Act
      const result = await telegramService.obtenerInfoGrupo(groupId);

      // Assert
      expect(result).toEqual(mockGroupInfo);
      expect(mockConnect).toHaveBeenCalled();
      expect(mockInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          className: 'GetChats'
        })
      );
    });

    // SRV-INT-037: Retornar null cuando grupo no existe
    it('SRV-INT-037: debe retornar null cuando el grupo no existe', async () => {
      // Arrange
      const groupId = -999999;
      const mockResponse = {
        chats: []
      };

      mockConnect.mockResolvedValue(undefined);
      mockInvoke.mockResolvedValue(mockResponse);

      // Act
      const result = await telegramService.obtenerInfoGrupo(groupId);

      // Assert
      expect(result).toBeNull();
    });

    // SRV-INT-038: Manejar error al obtener información del grupo
    it('SRV-INT-038: debe manejar error al obtener información del grupo', async () => {
      // Arrange
      const groupId = -123456789;

      mockConnect.mockResolvedValue(undefined);
      mockInvoke.mockRejectedValue(new Error('Group not accessible'));

      // Act & Assert
      await expect(telegramService.obtenerInfoGrupo(groupId))
        .rejects.toThrow(AppError);
      await expect(telegramService.obtenerInfoGrupo(groupId))
        .rejects.toThrow('Error al obtener información del grupo de Telegram');
    });
  });

  describe('verificarConexion', () => {
    // SRV-INT-039: Verificar conexión exitosamente
    it('SRV-INT-039: debe verificar conexión con Telegram exitosamente', async () => {
      // Arrange
      const mockUser = {
        id: 123456,
        firstName: 'Bot',
        lastName: 'Test'
      };

      mockConnect.mockResolvedValue(undefined);
      mockTelegramClient.getMe.mockResolvedValue(mockUser);

      // Act
      const result = await telegramService.verificarConexion();

      // Assert
      expect(result).toBe(true);
      expect(mockConnect).toHaveBeenCalled();
    });

    // SRV-INT-040: Manejar error en verificación de conexión
    it('SRV-INT-040: debe manejar error en verificación de conexión', async () => {
      // Arrange
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      // Act
      const result = await telegramService.verificarConexion();

      // Assert
      expect(result).toBe(false);
    });
  });
});
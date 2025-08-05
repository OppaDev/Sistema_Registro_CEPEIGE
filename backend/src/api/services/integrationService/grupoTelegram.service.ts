import { PrismaClient } from "@prisma/client";
import {
  CreateGrupoTelegramDto,
  UpdateGrupoTelegramDto,
  GrupoTelegramResponseDto,
  GrupoTelegramWithCursoDto,
} from "@/api/dtos/integrationDto/grupoTelegram.dto";
import { NotFoundError, ConflictError, AppError } from "@/utils/errorTypes";
import { 
  toGrupoTelegramResponseDto, 
  toGrupoTelegramWithCursoDto,
  type PrismaGrupoTelegramConCurso 
} from "@/api/services/mappers/integrationMapper/grupoTelegram.mapper";
import { logger } from "@/utils/logger";

const prisma = new PrismaClient();

interface GetAllGruposTelegramOptions {
  page: number;
  limit: number;
  orderBy: string;
  order: "asc" | "desc";
  incluirInactivos?: boolean;
}

export class GrupoTelegramService {

  async createGrupoTelegram(data: CreateGrupoTelegramDto): Promise<GrupoTelegramResponseDto> {
    try {
      // Validar que el curso exista
      const curso = await prisma.curso.findUnique({ where: { idCurso: data.idCurso } });
      if (!curso) {
        throw new NotFoundError(`Curso con ID ${data.idCurso}`);
      }

      // Verificar que no exista ya un grupo de Telegram para este curso
      const grupoTelegramExistente = await prisma.grupoTelegram.findUnique({
        where: { idCurso: data.idCurso }
      });
      if (grupoTelegramExistente) {
        throw new ConflictError(`El curso con ID ${data.idCurso} ya tiene un grupo de Telegram`);
      }

      // Verificar que el ID de grupo de Telegram no esté en uso
      const telegramIdEnUso = await prisma.grupoTelegram.findFirst({
        where: { telegramGroupId: data.telegramGroupId }
      });
      if (telegramIdEnUso) {
        throw new ConflictError(`El ID de grupo de Telegram ${data.telegramGroupId} ya está en uso`);
      }

      const grupoTelegram = await prisma.grupoTelegram.create({
        data: {
          idCurso: data.idCurso,
          telegramGroupId: data.telegramGroupId,
          nombreGrupo: data.nombreGrupo,
          enlaceInvitacion: data.enlaceInvitacion,
          activo: data.activo ?? true,
        }
      });

      logger.info(`Grupo de Telegram creado para curso ${data.idCurso}`, {
        grupoTelegramId: grupoTelegram.idGrupoTelegram,
        telegramGroupId: data.telegramGroupId,
        nombreGrupo: data.nombreGrupo
      });

      return toGrupoTelegramResponseDto(grupoTelegram);

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al crear grupo de Telegram: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al crear grupo de Telegram", 500);
    }
  }

  async updateGrupoTelegram(idCurso: number, data: UpdateGrupoTelegramDto): Promise<GrupoTelegramResponseDto> {
    try {
      // Verificar que el grupo de Telegram exista
      const grupoTelegramExistente = await prisma.grupoTelegram.findUnique({
        where: { idCurso }
      });
      if (!grupoTelegramExistente) {
        throw new NotFoundError(`Grupo de Telegram para curso con ID ${idCurso}`);
      }

      // Si se actualiza el ID de grupo de Telegram, verificar que no esté en uso
      if (data.telegramGroupId && data.telegramGroupId !== grupoTelegramExistente.telegramGroupId) {
        const telegramIdEnUso = await prisma.grupoTelegram.findFirst({
          where: { 
            telegramGroupId: data.telegramGroupId,
            idCurso: { not: idCurso }
          }
        });
        if (telegramIdEnUso) {
          throw new ConflictError(`El ID de grupo de Telegram ${data.telegramGroupId} ya está en uso`);
        }
      }

      // Construir objeto de actualización solo con campos definidos
      const updateData: any = {};
      if (data.telegramGroupId !== undefined) updateData.telegramGroupId = data.telegramGroupId;
      if (data.nombreGrupo !== undefined) updateData.nombreGrupo = data.nombreGrupo;
      if (data.enlaceInvitacion !== undefined) updateData.enlaceInvitacion = data.enlaceInvitacion;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const grupoTelegramActualizado = await prisma.grupoTelegram.update({
        where: { idCurso },
        data: updateData
      });

      logger.info(`Grupo de Telegram actualizado para curso ${idCurso}`, {
        grupoTelegramId: grupoTelegramActualizado.idGrupoTelegram,
        cambios: updateData
      });

      return toGrupoTelegramResponseDto(grupoTelegramActualizado);

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al actualizar grupo de Telegram: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al actualizar grupo de Telegram", 500);
    }
  }

  async getGrupoTelegramByIdCurso(idCurso: number): Promise<GrupoTelegramWithCursoDto> {
    try {
      const grupoTelegram = await prisma.grupoTelegram.findUnique({
        where: { idCurso },
        include: { curso: true }
      });

      if (!grupoTelegram) {
        throw new NotFoundError(`Grupo de Telegram para curso con ID ${idCurso}`);
      }

      return toGrupoTelegramWithCursoDto(grupoTelegram as PrismaGrupoTelegramConCurso);

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al obtener grupo de Telegram: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener grupo de Telegram", 500);
    }
  }

  async getAllGruposTelegram(options: GetAllGruposTelegramOptions): Promise<{ gruposTelegram: GrupoTelegramWithCursoDto[]; total: number }> {
    try {
      const { page, limit, orderBy, order, incluirInactivos = false } = options;
      const skip = (page - 1) * limit;

      const whereCondition = incluirInactivos ? {} : { activo: true };

      const [gruposTelegram, total] = await Promise.all([
        prisma.grupoTelegram.findMany({
          skip,
          take: limit,
          where: whereCondition,
          orderBy: { [orderBy]: order },
          include: { curso: true }
        }),
        prisma.grupoTelegram.count({ where: whereCondition }),
      ]);

      return {
        gruposTelegram: gruposTelegram.map((grupoTelegram) => 
          toGrupoTelegramWithCursoDto(grupoTelegram as PrismaGrupoTelegramConCurso)
        ),
        total,
      };

    } catch (error: any) {
      if (error instanceof Error) {
        throw new AppError(`Error al obtener grupos de Telegram: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener grupos de Telegram", 500);
    }
  }

  async deleteGrupoTelegram(idCurso: number): Promise<boolean> {
    try {
      // Verificar que el grupo de Telegram exista
      const grupoTelegramExistente = await prisma.grupoTelegram.findUnique({
        where: { idCurso }
      });
      if (!grupoTelegramExistente) {
        throw new NotFoundError(`Grupo de Telegram para curso con ID ${idCurso}`);
      }

      await prisma.grupoTelegram.delete({
        where: { idCurso }
      });

      logger.info(`Grupo de Telegram eliminado para curso ${idCurso}`, {
        grupoTelegramId: grupoTelegramExistente.idGrupoTelegram
      });

      return true;

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al eliminar grupo de Telegram: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al eliminar grupo de Telegram", 500);
    }
  }

  async existeGrupoTelegram(idCurso: number): Promise<boolean> {
    try {
      const grupoTelegram = await prisma.grupoTelegram.findUnique({
        where: { idCurso, activo: true }
      });
      return grupoTelegram !== null;
    } catch (error: any) {
      logger.error(`Error al verificar grupo de Telegram para curso ${idCurso}:`, error);
      return false;
    }
  }

  async obtenerEnlaceInvitacion(idCurso: number): Promise<string | null> {
    try {
      const grupoTelegram = await prisma.grupoTelegram.findUnique({
        where: { idCurso, activo: true }
      });
      return grupoTelegram?.enlaceInvitacion || null;
    } catch (error: any) {
      logger.error(`Error al obtener enlace de invitación para curso ${idCurso}:`, error);
      return null;
    }
  }

  async obtenerTelegramGroupId(idCurso: number): Promise<string | null> {
    try {
      const grupoTelegram = await prisma.grupoTelegram.findUnique({
        where: { idCurso, activo: true }
      });
      return grupoTelegram?.telegramGroupId || null;
    } catch (error: any) {
      logger.error(`Error al obtener ID de grupo de Telegram para curso ${idCurso}:`, error);
      return null;
    }
  }
}
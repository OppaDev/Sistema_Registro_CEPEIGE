import { PrismaClient } from "@prisma/client";
import {
  CreateInscripcionMoodleDto,
  UpdateInscripcionMoodleDto,
  InscripcionMoodleResponseDto,
  InscripcionMoodleWithInscripcionDto,
  EstadoMatriculaMoodle,
} from "@/api/dtos/integrationDto/inscripcionMoodle.dto";
import { NotFoundError, ConflictError, AppError } from "@/utils/errorTypes";
import { 
  toInscripcionMoodleResponseDto, 
  toInscripcionMoodleWithInscripcionDto,
  type PrismaInscripcionMoodleConInscripcion 
} from "@/api/services/mappers/integrationMapper/inscripcionMoodle.mapper";
import { logger } from "@/utils/logger";

const prisma = new PrismaClient();

interface GetAllInscripcionesMoodleOptions {
  page: number;
  limit: number;
  orderBy: string;
  order: "asc" | "desc";
  estado?: EstadoMatriculaMoodle;
  cursoId?: number;
}

export class InscripcionMoodleService {

  async createInscripcionMoodle(data: CreateInscripcionMoodleDto): Promise<InscripcionMoodleResponseDto> {
    try {
      // Validar que la inscripción exista
      const inscripcion = await prisma.inscripcion.findUnique({ where: { idInscripcion: data.idInscripcion } });
      if (!inscripcion) {
        throw new NotFoundError(`Inscripción con ID ${data.idInscripcion}`);
      }

      // Verificar que no exista ya una integración con Moodle para esta inscripción
      const inscripcionMoodleExistente = await prisma.inscripcionMoodle.findUnique({
        where: { idInscripcion: data.idInscripcion }
      });
      if (inscripcionMoodleExistente) {
        throw new ConflictError(`La inscripción con ID ${data.idInscripcion} ya tiene una integración con Moodle`);
      }

      // Verificar que el ID de usuario de Moodle no esté en uso para el mismo curso
      const inscripcionConUsuario = await prisma.inscripcionMoodle.findFirst({
        where: { 
          moodleUserId: data.moodleUserId,
          inscripcion: {
            idCurso: inscripcion.idCurso
          }
        }
      });
      if (inscripcionConUsuario) {
        throw new ConflictError(`El usuario de Moodle ${data.moodleUserId} ya está matriculado en este curso`);
      }

      const inscripcionMoodle = await prisma.inscripcionMoodle.create({
        data: {
          idInscripcion: data.idInscripcion,
          moodleUserId: data.moodleUserId,
          moodleUsername: data.moodleUsername,
          estadoMatricula: data.estadoMatricula || EstadoMatriculaMoodle.MATRICULADO,
          notas: data.notas || null,
        }
      });

      logger.info(`Integración Moodle creada para inscripción ${data.idInscripcion}`, {
        inscripcionMoodleId: inscripcionMoodle.idInscripcionMoodle,
        moodleUserId: data.moodleUserId,
        moodleUsername: data.moodleUsername,
        estadoMatricula: inscripcionMoodle.estadoMatricula
      });

      return toInscripcionMoodleResponseDto(inscripcionMoodle);

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al crear integración Moodle para inscripción: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al crear integración Moodle para inscripción", 500);
    }
  }

  async updateInscripcionMoodle(idInscripcion: number, data: UpdateInscripcionMoodleDto): Promise<InscripcionMoodleResponseDto> {
    try {
      // Verificar que la integración Moodle exista
      const inscripcionMoodleExistente = await prisma.inscripcionMoodle.findUnique({
        where: { idInscripcion },
        include: { inscripcion: true }
      });
      if (!inscripcionMoodleExistente) {
        throw new NotFoundError(`Integración Moodle para inscripción con ID ${idInscripcion}`);
      }

      // Si se actualiza el ID de usuario de Moodle, verificar que no esté en uso para el mismo curso
      if (data.moodleUserId && data.moodleUserId !== inscripcionMoodleExistente.moodleUserId) {
        const inscripcionConUsuario = await prisma.inscripcionMoodle.findFirst({
          where: { 
            moodleUserId: data.moodleUserId,
            idInscripcion: { not: idInscripcion },
            inscripcion: {
              idCurso: inscripcionMoodleExistente.inscripcion.idCurso
            }
          }
        });
        if (inscripcionConUsuario) {
          throw new ConflictError(`El usuario de Moodle ${data.moodleUserId} ya está matriculado en este curso`);
        }
      }

      // Construir objeto de actualización solo con campos definidos
      const updateData: any = {};
      if (data.moodleUserId !== undefined) updateData.moodleUserId = data.moodleUserId;
      if (data.moodleUsername !== undefined) updateData.moodleUsername = data.moodleUsername;
      if (data.estadoMatricula !== undefined) updateData.estadoMatricula = data.estadoMatricula;
      if (data.notas !== undefined) updateData.notas = data.notas;

      const inscripcionMoodleActualizada = await prisma.inscripcionMoodle.update({
        where: { idInscripcion },
        data: updateData
      });

      logger.info(`Integración Moodle actualizada para inscripción ${idInscripcion}`, {
        inscripcionMoodleId: inscripcionMoodleActualizada.idInscripcionMoodle,
        cambios: updateData
      });

      return toInscripcionMoodleResponseDto(inscripcionMoodleActualizada);

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al actualizar integración Moodle para inscripción: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al actualizar integración Moodle para inscripción", 500);
    }
  }

  async getInscripcionMoodleByIdInscripcion(idInscripcion: number): Promise<InscripcionMoodleWithInscripcionDto> {
    try {
      const inscripcionMoodle = await prisma.inscripcionMoodle.findUnique({
        where: { idInscripcion },
        include: { 
          inscripcion: {
            include: {
              persona: true,
              curso: true
            }
          }
        }
      });

      if (!inscripcionMoodle) {
        throw new NotFoundError(`Integración Moodle para inscripción con ID ${idInscripcion}`);
      }

      return toInscripcionMoodleWithInscripcionDto(inscripcionMoodle as PrismaInscripcionMoodleConInscripcion);

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al obtener integración Moodle para inscripción: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener integración Moodle para inscripción", 500);
    }
  }

  async getAllInscripcionesMoodle(options: GetAllInscripcionesMoodleOptions): Promise<{ inscripcionesMoodle: InscripcionMoodleWithInscripcionDto[]; total: number }> {
    try {
      const { page, limit, orderBy, order, estado, cursoId } = options;
      const skip = (page - 1) * limit;

      // Construir condiciones de filtrado
      const whereCondition: any = {};
      if (estado) whereCondition.estadoMatricula = estado;
      if (cursoId) whereCondition.inscripcion = { idCurso: cursoId };

      const [inscripcionesMoodle, total] = await Promise.all([
        prisma.inscripcionMoodle.findMany({
          skip,
          take: limit,
          where: whereCondition,
          orderBy: { [orderBy]: order },
          include: { 
            inscripcion: {
              include: {
                persona: true,
                curso: true
              }
            }
          }
        }),
        prisma.inscripcionMoodle.count({ where: whereCondition }),
      ]);

      return {
        inscripcionesMoodle: inscripcionesMoodle.map((inscripcionMoodle) => 
          toInscripcionMoodleWithInscripcionDto(inscripcionMoodle as PrismaInscripcionMoodleConInscripcion)
        ),
        total,
      };

    } catch (error: any) {
      if (error instanceof Error) {
        throw new AppError(`Error al obtener integraciones Moodle para inscripciones: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener integraciones Moodle para inscripciones", 500);
    }
  }

  async deleteInscripcionMoodle(idInscripcion: number): Promise<boolean> {
    try {
      // Verificar que la integración Moodle exista
      const inscripcionMoodleExistente = await prisma.inscripcionMoodle.findUnique({
        where: { idInscripcion }
      });
      if (!inscripcionMoodleExistente) {
        throw new NotFoundError(`Integración Moodle para inscripción con ID ${idInscripcion}`);
      }

      await prisma.inscripcionMoodle.delete({
        where: { idInscripcion }
      });

      logger.info(`Integración Moodle eliminada para inscripción ${idInscripcion}`, {
        inscripcionMoodleId: inscripcionMoodleExistente.idInscripcionMoodle
      });

      return true;

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al eliminar integración Moodle para inscripción: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al eliminar integración Moodle para inscripción", 500);
    }
  }

  async existeIntegracionMoodle(idInscripcion: number): Promise<boolean> {
    try {
      const inscripcionMoodle = await prisma.inscripcionMoodle.findUnique({
        where: { idInscripcion }
      });
      return inscripcionMoodle !== null;
    } catch (error: any) {
      logger.error(`Error al verificar integración Moodle para inscripción ${idInscripcion}:`, error);
      return false;
    }
  }

  async obtenerMoodleUserId(idInscripcion: number): Promise<number | null> {
    try {
      const inscripcionMoodle = await prisma.inscripcionMoodle.findUnique({
        where: { idInscripcion }
      });
      return inscripcionMoodle?.moodleUserId || null;
    } catch (error: any) {
      logger.error(`Error al obtener ID de usuario de Moodle para inscripción ${idInscripcion}:`, error);
      return null;
    }
  }

  async cambiarEstadoMatricula(idInscripcion: number, nuevoEstado: EstadoMatriculaMoodle, notas?: string): Promise<InscripcionMoodleResponseDto> {
    try {
      const updateData: any = { estadoMatricula: nuevoEstado };
      if (notas !== undefined) updateData.notas = notas;

      const inscripcionMoodleActualizada = await prisma.inscripcionMoodle.update({
        where: { idInscripcion },
        data: updateData
      });

      logger.info(`Estado de matrícula Moodle cambiado para inscripción ${idInscripcion}`, {
        inscripcionMoodleId: inscripcionMoodleActualizada.idInscripcionMoodle,
        estadoAnterior: inscripcionMoodleActualizada.estadoMatricula,
        estadoNuevo: nuevoEstado,
        notas
      });

      return toInscripcionMoodleResponseDto(inscripcionMoodleActualizada);

    } catch (error: any) {
      if (error instanceof Error) {
        throw new AppError(`Error al cambiar estado de matrícula Moodle: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al cambiar estado de matrícula Moodle", 500);
    }
  }
}
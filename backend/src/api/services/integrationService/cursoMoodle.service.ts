import { PrismaClient } from "@prisma/client";
import {
  CreateCursoMoodleDto,
  UpdateCursoMoodleDto,
  CursoMoodleResponseDto,
  CursoMoodleWithCursoDto,
} from "@/api/dtos/integrationDto/cursoMoodle.dto";
import { NotFoundError, ConflictError, AppError } from "@/utils/errorTypes";
import { 
  toCursoMoodleResponseDto, 
  toCursoMoodleWithCursoDto,
  type PrismaCursoMoodleConCurso 
} from "@/api/services/mappers/integrationMapper/cursoMoodle.mapper";
import { logger } from "@/utils/logger";


interface GetAllCursosMoodleOptions {
  page: number;
  limit: number;
  orderBy: string;
  order: "asc" | "desc";
  incluirInactivos?: boolean;
}

export class CursoMoodleService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async createCursoMoodle(data: CreateCursoMoodleDto): Promise<CursoMoodleResponseDto> {
    try {
      // Validar que el curso exista
      const curso = await this.prisma.curso.findUnique({ where: { idCurso: data.idCurso } });
      if (!curso) {
        throw new NotFoundError(`Curso con ID ${data.idCurso}`);
      }

      // Verificar que no exista ya una integración con Moodle para este curso
      const cursoMoodleExistente = await this.prisma.cursoMoodle.findUnique({
        where: { idCurso: data.idCurso }
      });
      if (cursoMoodleExistente) {
        throw new ConflictError(`El curso con ID ${data.idCurso} ya tiene una integración con Moodle`);
      }

      // Verificar que el ID de Moodle no esté en uso
      const moodleIdEnUso = await this.prisma.cursoMoodle.findFirst({
        where: { moodleCursoId: data.moodleCursoId }
      });
      if (moodleIdEnUso) {
        throw new ConflictError(`El ID de curso en Moodle ${data.moodleCursoId} ya está en uso`);
      }

      const cursoMoodle = await this.prisma.cursoMoodle.create({
        data: {
          idCurso: data.idCurso,
          moodleCursoId: data.moodleCursoId,
          nombreCortoMoodle: data.nombreCortoMoodle,
          activo: data.activo ?? true,
        }
      });

      logger.info(`Integración Moodle creada para curso ${data.idCurso}`, {
        cursoMoodleId: cursoMoodle.idCursoMoodle,
        moodleCursoId: data.moodleCursoId,
        nombreCortoMoodle: data.nombreCortoMoodle
      });

      return toCursoMoodleResponseDto(cursoMoodle);

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al crear integración Moodle: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al crear integración Moodle", 500);
    }
  }

  async updateCursoMoodle(idCurso: number, data: UpdateCursoMoodleDto): Promise<CursoMoodleResponseDto> {
    try {
      // Verificar que la integración Moodle exista
      const cursoMoodleExistente = await this.prisma.cursoMoodle.findUnique({
        where: { idCurso }
      });
      if (!cursoMoodleExistente) {
        throw new NotFoundError(`Integración Moodle para curso con ID ${idCurso}`);
      }

      // Si se actualiza el ID de Moodle, verificar que no esté en uso
      if (data.moodleCursoId && data.moodleCursoId !== cursoMoodleExistente.moodleCursoId) {
        const moodleIdEnUso = await this.prisma.cursoMoodle.findFirst({
          where: { 
            moodleCursoId: data.moodleCursoId,
            idCurso: { not: idCurso }
          }
        });
        if (moodleIdEnUso) {
          throw new ConflictError(`El ID de curso en Moodle ${data.moodleCursoId} ya está en uso`);
        }
      }

      // Construir objeto de actualización solo con campos definidos
      const updateData: any = {};
      if (data.moodleCursoId !== undefined) updateData.moodleCursoId = data.moodleCursoId;
      if (data.nombreCortoMoodle !== undefined) updateData.nombreCortoMoodle = data.nombreCortoMoodle;
      if (data.activo !== undefined) updateData.activo = data.activo;

  const cursoMoodleActualizado = await this.prisma.cursoMoodle.update({
        where: { idCurso },
        data: updateData
      });

      logger.info(`Integración Moodle actualizada para curso ${idCurso}`, {
        cursoMoodleId: cursoMoodleActualizado.idCursoMoodle,
        cambios: updateData
      });

      return toCursoMoodleResponseDto(cursoMoodleActualizado);

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al actualizar integración Moodle: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al actualizar integración Moodle", 500);
    }
  }

  async getCursoMoodleByIdCurso(idCurso: number): Promise<CursoMoodleWithCursoDto> {
    try {
  const cursoMoodle = await this.prisma.cursoMoodle.findUnique({
        where: { idCurso },
        include: { curso: true }
      });

      if (!cursoMoodle) {
        throw new NotFoundError(`Integración Moodle para curso con ID ${idCurso}`);
      }

      return toCursoMoodleWithCursoDto(cursoMoodle as PrismaCursoMoodleConCurso);

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al obtener integración Moodle: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener integración Moodle", 500);
    }
  }

  async getAllCursosMoodle(options: GetAllCursosMoodleOptions): Promise<{ cursosMoodle: CursoMoodleWithCursoDto[]; total: number }> {
    try {
      const { page, limit, orderBy, order, incluirInactivos = false } = options;
      const skip = (page - 1) * limit;

      const whereCondition = incluirInactivos ? {} : { activo: true };

      const [cursosMoodle, total] = await Promise.all([
  this.prisma.cursoMoodle.findMany({
          skip,
          take: limit,
          where: whereCondition,
          orderBy: { [orderBy]: order },
          include: { curso: true }
        }),
  this.prisma.cursoMoodle.count({ where: whereCondition }),
      ]);

      return {
        cursosMoodle: cursosMoodle.map((cursoMoodle) => 
          toCursoMoodleWithCursoDto(cursoMoodle as PrismaCursoMoodleConCurso)
        ),
        total,
      };

    } catch (error: any) {
      if (error instanceof Error) {
        throw new AppError(`Error al obtener integraciones Moodle: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener integraciones Moodle", 500);
    }
  }

  async deleteCursoMoodle(idCurso: number): Promise<boolean> {
    try {
      // Verificar que la integración Moodle exista
  const cursoMoodleExistente = await this.prisma.cursoMoodle.findUnique({
        where: { idCurso }
      });
      if (!cursoMoodleExistente) {
        throw new NotFoundError(`Integración Moodle para curso con ID ${idCurso}`);
      }

  await this.prisma.cursoMoodle.delete({
        where: { idCurso }
      });

      logger.info(`Integración Moodle eliminada para curso ${idCurso}`, {
        cursoMoodleId: cursoMoodleExistente.idCursoMoodle
      });

      return true;

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al eliminar integración Moodle: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al eliminar integración Moodle", 500);
    }
  }

  async existeIntegracionMoodle(idCurso: number): Promise<boolean> {
    try {
  const cursoMoodle = await this.prisma.cursoMoodle.findUnique({
        where: { idCurso, activo: true }
      });
      return cursoMoodle !== null;
    } catch (error: any) {
      logger.error(`Error al verificar integración Moodle para curso ${idCurso}:`, error);
      return false;
    }
  }

  async obtenerMoodleCursoId(idCurso: number): Promise<number | null> {
    try {
  const cursoMoodle = await this.prisma.cursoMoodle.findUnique({
        where: { idCurso, activo: true }
      });
      return cursoMoodle?.moodleCursoId || null;
    } catch (error: any) {
      logger.error(`Error al obtener ID de Moodle para curso ${idCurso}:`, error);
      return null;
    }
  }
}
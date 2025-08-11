import { GrupoTelegram as PrismaGrupoTelegram, Curso as PrismaCurso } from "@prisma/client";
import { 
  GrupoTelegramResponseDto, 
  GrupoTelegramWithCursoDto 
} from "@/api/dtos/integrationDto/grupoTelegram.dto";

export type PrismaGrupoTelegramConCurso = PrismaGrupoTelegram & {
  curso: PrismaCurso;
};

export const toGrupoTelegramResponseDto = (grupoTelegram: PrismaGrupoTelegram): GrupoTelegramResponseDto => {
  return {
    idGrupoTelegram: grupoTelegram.idGrupoTelegram,
    idCurso: grupoTelegram.idCurso,
    telegramGroupId: grupoTelegram.telegramGroupId,
    nombreGrupo: grupoTelegram.nombreGrupo,
    enlaceInvitacion: grupoTelegram.enlaceInvitacion,
    fechaCreacion: grupoTelegram.fechaCreacion,
    fechaActualizacion: grupoTelegram.fechaActualizacion,
    activo: grupoTelegram.activo,
  };
};

export const toGrupoTelegramWithCursoDto = (grupoTelegramConCurso: PrismaGrupoTelegramConCurso): GrupoTelegramWithCursoDto => {
  return {
    idGrupoTelegram: grupoTelegramConCurso.idGrupoTelegram,
    idCurso: grupoTelegramConCurso.idCurso,
    telegramGroupId: grupoTelegramConCurso.telegramGroupId,
    nombreGrupo: grupoTelegramConCurso.nombreGrupo,
    enlaceInvitacion: grupoTelegramConCurso.enlaceInvitacion,
    fechaCreacion: grupoTelegramConCurso.fechaCreacion,
    fechaActualizacion: grupoTelegramConCurso.fechaActualizacion,
    activo: grupoTelegramConCurso.activo,
    curso: {
      idCurso: grupoTelegramConCurso.curso.idCurso,
      nombreCortoCurso: grupoTelegramConCurso.curso.nombreCortoCurso,
      nombreCurso: grupoTelegramConCurso.curso.nombreCurso,
      modalidadCurso: grupoTelegramConCurso.curso.modalidadCurso,
      fechaInicioCurso: grupoTelegramConCurso.curso.fechaInicioCurso,
      fechaFinCurso: grupoTelegramConCurso.curso.fechaFinCurso,
    },
  };
};
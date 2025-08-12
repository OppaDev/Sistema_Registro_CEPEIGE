import { PrismaClient } from "@prisma/client";
import {
  CreateInscripcionDto,
  UpdateInscripcionDto,
  InscripcionResponseDto,
  InscripcionAdminResponseDto,
} from "@/api/dtos/inscripcionDto/inscripcion.dto";
import { NotFoundError, ConflictError, AppError } from "@/utils/errorTypes";
import { 
  toInscripcionResponseDto, 
  toInscripcionAdminResponseDto,
  type PrismaInscripcionConRelaciones,
  type PrismaInscripcionAdminConRelaciones 
} from "@/api/services/mappers/inscripcionMapper/inscripcion.mapper";
import { inscripcionMoodleTrigger } from "@/triggers/inscripcionMoodle.trigger";
import { inscripcionTelegramTrigger } from "@/triggers/inscripcionTelegram.trigger";
import { FacturaService } from "@/api/services/validarPagoService/factura.service";

const prisma = new PrismaClient();
const facturaService = new FacturaService();

interface GetAllInscripcionesOptions {
  page: number;
  limit: number;
  orderBy: string;
  order: "asc" | "desc";
}

export class InscripcionService {
  // Crear una nueva inscripción
  async createInscripcion(data: CreateInscripcionDto): Promise<InscripcionResponseDto> {
    // 1. Validar existencia de IDs referenciados (Curso, Persona, DatosFacturacion, Comprobante)
    const cursoPromise = prisma.curso.findUnique({ where: { idCurso: data.idCurso } });
    const personaPromise = prisma.datosPersonales.findUnique({ where: { idPersona: data.idPersona } });
    const datosFacturacionPromise = prisma.datosFacturacion.findUnique({ where: { idFacturacion: data.idFacturacion } });
    const comprobantePromise = prisma.comprobante.findUnique({ where: { idComprobante: data.idComprobante } });

    const [curso, persona, datosFacturacion, comprobante] = await Promise.all([
      cursoPromise, personaPromise, datosFacturacionPromise, comprobantePromise
    ]);

    if (!curso) throw new NotFoundError(`Curso con ID ${data.idCurso}`);
    if (!persona) throw new NotFoundError(`Persona con ID ${data.idPersona}`);
    if (!datosFacturacion) throw new NotFoundError(`Datos de facturación con ID ${data.idFacturacion}`);
    if (!comprobante) throw new NotFoundError(`Comprobante con ID ${data.idComprobante}`);

    // 2. Verificar si el comprobante ya está asignado a otra inscripción
    const inscripcionConComprobante = await prisma.inscripcion.findUnique({
        where: { idComprobante: data.idComprobante }
    });
    if (inscripcionConComprobante) {
        throw new ConflictError(`El comprobante con ID ${data.idComprobante} ya está asignado a la inscripción ID ${inscripcionConComprobante.idInscripcion}.`);
    }

    // 3. Verificar si la persona ya está inscrita en ese curso
    const inscripcionExistente = await prisma.inscripcion.findFirst({
      where: {
        idCurso: data.idCurso,
        idPersona: data.idPersona,
      }
    });
    if (inscripcionExistente) {
      throw new ConflictError(`La persona con ID ${data.idPersona} ya está inscrita en el curso con ID ${data.idCurso}.`);
    }

    try {
      const nuevaInscripcion = await prisma.inscripcion.create({
        data: {
          idCurso: data.idCurso,
          idPersona: data.idPersona,
          idFacturacion: data.idFacturacion,
          idComprobante: data.idComprobante,
        },
        include: { 
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
        }
      });
      return toInscripcionResponseDto(nuevaInscripcion as PrismaInscripcionConRelaciones);
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('idComprobante')) {
        throw new ConflictError(`El comprobante con ID ${data.idComprobante} ya está en uso por otra inscripción.`);
      }
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al crear la inscripción: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al crear la inscripción", 500);
    }
  }

  // Actualizar una inscripción
  async updateInscripcion(idInscripcion: number, data: UpdateInscripcionDto): Promise<InscripcionAdminResponseDto> {
    // 1) Obtener y validar inscripción
    const inscripcionExistente = await this.obtenerInscripcionConPersona(idInscripcion);

    // 2) Validar descuento si aplica
    await this.validarDescuentoSiAplica(data.idDescuento);

    // 3) Verificar si hay cambio a matriculado y validar pago
    const cambioAMatriculado = this.esCambioAMatriculado(data, inscripcionExistente);
    if (cambioAMatriculado) {
      await this.validarPagoParaMatricula(idInscripcion);
    }

    try {
      // 4) Actualizar datos
      const updateData = this.construirUpdateData(data);

      const inscripcionActualizada = await prisma.inscripcion.update({
        where: { idInscripcion },
        data: updateData,
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
          descuento: true,
        },
      });

      // 5) Ejecutar triggers si corresponde
      await this.ejecutarTriggersMatriculaSiNecesario(cambioAMatriculado, idInscripcion, inscripcionActualizada);

      return toInscripcionAdminResponseDto(inscripcionActualizada as PrismaInscripcionAdminConRelaciones);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al actualizar la inscripción: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al actualizar la inscripción", 500);
    }
  }

  // Helpers extraídos para reducir complejidad cognitiva
  private async obtenerInscripcionConPersona(idInscripcion: number) {
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { idInscripcion },
      include: { persona: true },
    });
    if (!inscripcion) {
      throw new NotFoundError(`Inscripción con ID ${idInscripcion}`);
    }
    return inscripcion;
  }

  private async validarDescuentoSiAplica(idDescuento?: number): Promise<void> {
    if (!idDescuento) return;
    const descuento = await prisma.descuento.findUnique({ where: { idDescuento } });
    if (!descuento) throw new NotFoundError(`Descuento con ID ${idDescuento}`);
  }

  private esCambioAMatriculado(data: UpdateInscripcionDto, existente: any): boolean {
    return data.matricula === true && existente.matricula === false;
  }

  private async validarPagoParaMatricula(idInscripcion: number): Promise<void> {
    const facturas = await facturaService.getFacturasByInscripcionId(idInscripcion);
    if (facturas.length === 0) {
      throw new ConflictError(`No se puede matricular: No existe factura para la inscripción ID ${idInscripcion}`);
    }
    const pagoVerificado = facturas.some((f) => f.verificacionPago === true);
    if (!pagoVerificado) {
      throw new ConflictError(`No se puede matricular: El pago no ha sido verificado para la inscripción ID ${idInscripcion}`);
    }
  }

  private construirUpdateData(data: UpdateInscripcionDto): Record<string, unknown> {
    const updateData: any = {};
    if (data.idDescuento !== undefined) updateData.idDescuento = data.idDescuento;
    if (data.matricula !== undefined) updateData.matricula = data.matricula;
    return updateData;
  }

  private async ejecutarTriggersMatriculaSiNecesario(
    cambioAMatriculado: boolean,
    idInscripcion: number,
    inscripcionActualizada: any
  ): Promise<void> {
    if (!cambioAMatriculado) return;
    
    // Skip Moodle integration in test environment
    if (process.env['NODE_ENV'] !== 'test') {
      await inscripcionMoodleTrigger.ejecutarMatriculaEnMoodle(idInscripcion, inscripcionActualizada);
    }
    
    // Skip Telegram integration in test environment  
    if (process.env['NODE_ENV'] !== 'test') {
      await inscripcionTelegramTrigger.ejecutarInvitacionTelegram(idInscripcion, inscripcionActualizada);
    }
  }
  
  // Obtener todas las inscripciones con información completa para administradores
  async getAllInscripciones(options: GetAllInscripcionesOptions): Promise<{ inscripciones: InscripcionAdminResponseDto[]; total: number }> {
    try {
      const { page, limit, orderBy, order } = options;
      const skip = (page - 1) * limit;

      const [inscripciones, total] = await Promise.all([
        prisma.inscripcion.findMany({
          skip,
          take: limit,
          orderBy: {
            [orderBy]: order,
          },
          include: {
            curso: true,
            persona: true,
            datosFacturacion: true,
            comprobante: true,
            descuento: true,
          },
        }),
        prisma.inscripcion.count(),
      ]);

      return {
        inscripciones: inscripciones.map((inscripcion) => 
          toInscripcionAdminResponseDto(inscripcion as PrismaInscripcionAdminConRelaciones)
        ),
        total,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Error al obtener las inscripciones: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener las inscripciones", 500);
    }
  }

  // Obtener una inscripción por ID con información completa para administradores
  async getInscripcionById(idInscripcion: number): Promise<InscripcionAdminResponseDto> {
    try {
      const inscripcion = await prisma.inscripcion.findUnique({
        where: { idInscripcion },
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
          descuento: true,
        },
      });

      if (!inscripcion) {
        throw new NotFoundError(`Inscripción con ID ${idInscripcion}`);
      }

      return toInscripcionAdminResponseDto(inscripcion as PrismaInscripcionAdminConRelaciones);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al obtener la inscripción: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al obtener la inscripción", 500);
    }
  }

  // Eliminar una inscripción
  async deleteInscripcion(idInscripcion: number): Promise<boolean> {
    try {
      // Verificar que la inscripción exista
      const inscripcionExistente = await prisma.inscripcion.findUnique({
        where: { idInscripcion }
      });
      if (!inscripcionExistente) {
        throw new NotFoundError(`Inscripción con ID ${idInscripcion}`);
      }

      // Ejecutar trigger pre-eliminación
      await inscripcionMoodleTrigger.ejecutarPreEliminacion(idInscripcion);

      await prisma.inscripcion.delete({
        where: { idInscripcion }
      });

      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al eliminar la inscripción: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al eliminar la inscripción", 500);
    }
  }

    
}
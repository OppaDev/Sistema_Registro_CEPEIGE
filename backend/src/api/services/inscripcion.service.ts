import {
  PrismaClient,
  Inscripcion as PrismaInscripcion,
  Curso as PrismaCurso,
  DatosPersonales as PrismaDatosPersonales,
  DatosFacturacion as PrismaDatosFacturacion,
  Comprobante as PrismaComprobante,// Si decides incluir el objeto descuento
} from "@prisma/client";
import {
  CreateInscripcionDto,
  UpdateInscripcionDto,
  InscripcionResponseDto,
} from "@/api/dtos/inscripcion.dto";
import { NotFoundError, ConflictError, AppError } from "@/utils/errorTypes";

const prisma = new PrismaClient();

type PrismaInscripcionConRelaciones = PrismaInscripcion & {
  curso: PrismaCurso;
  persona: PrismaDatosPersonales;
  datosFacturacion: PrismaDatosFacturacion;
  comprobante: PrismaComprobante;
};

export class InscripcionService {
  // mapear CreateInscripcionDto a PrismaInscripcion
  private toInscripcionResponseDto(inscripcion: PrismaInscripcionConRelaciones): InscripcionResponseDto {
    return {
      idInscripcion: inscripcion.idInscripcion,
      fechaInscripcion: inscripcion.fechaInscripcion,
      curso: { 
        idCurso: inscripcion.curso.idCurso,
        nombreCurso: inscripcion.curso.nombreCurso,
        nombreCortoCurso: inscripcion.curso.nombreCortoCurso,
        descripcionCurso: inscripcion.curso.descripcionCurso,
        valorCurso: inscripcion.curso.valorCurso,
        fechaInicioCurso: inscripcion.curso.fechaInicioCurso,
        fechaFinCurso: inscripcion.curso.fechaFinCurso,
      },
      datosPersonales: { 
        idPersona: inscripcion.persona.idPersona,
        ciPasaporte: inscripcion.persona.ciPasaporte,
        nombres: inscripcion.persona.nombres,
        apellidos: inscripcion.persona.apellidos,
        correo: inscripcion.persona.correo,
        numTelefono: inscripcion.persona.numTelefono,
        pais: inscripcion.persona.pais,
        provinciaEstado: inscripcion.persona.provinciaEstado,
        ciudad: inscripcion.persona.ciudad,
        profesion: inscripcion.persona.profesion,
        institucion: inscripcion.persona.institucion,
      },
      datosFacturacion: { 
        idFacturacion: inscripcion.datosFacturacion.idFacturacion,
        razonSocial: inscripcion.datosFacturacion.razonSocial,
        identificacionTributaria: inscripcion.datosFacturacion.identificacionTributaria,
        telefono: inscripcion.datosFacturacion.telefono,
        correoFactura: inscripcion.datosFacturacion.correoFactura,
        direccion: inscripcion.datosFacturacion.direccion,
      },
      comprobante: { 
        idComprobante: inscripcion.comprobante.idComprobante,
        fechaSubida: inscripcion.comprobante.fechaSubida,
        nombreArchivo: inscripcion.comprobante.nombreArchivo,
        rutaComprobante: inscripcion.comprobante.rutaComprobante,
        tipoArchivo: inscripcion.comprobante.tipoArchivo,
      },
    };
  }

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
      return this.toInscripcionResponseDto(nuevaInscripcion as PrismaInscripcionConRelaciones);
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
  async updateInscripcion(idInscripcion: number, data: UpdateInscripcionDto): Promise<InscripcionResponseDto> {
    // Verificar que la inscripción exista
    const inscripcionExistente = await prisma.inscripcion.findUnique({
      where: { idInscripcion }
    });
    if (!inscripcionExistente) {
      throw new NotFoundError(`Inscripción con ID ${idInscripcion}`);
    }

    // Validar existencia de idDescuento si se provee
    if (data.idDescuento) {
      const descuento = await prisma.descuento.findUnique({ where: { idDescuento: data.idDescuento }});
      if (!descuento) throw new NotFoundError(`Descuento con ID ${data.idDescuento}`);
    }    try {
      // Construir el objeto data solo con propiedades definidas
      const updateData: any = {};
      if (data.idDescuento !== undefined) {
        updateData.idDescuento = data.idDescuento;
      }
      if (data.matricula !== undefined) {
        updateData.matricula = data.matricula;
      }

      const inscripcionActualizada = await prisma.inscripcion.update({
        where: { idInscripcion },
        data: updateData,
        include: {
          curso: true,
          persona: true,
          datosFacturacion: true,
          comprobante: true,
          descuento: true,
        }
      });
      return this.toInscripcionResponseDto(inscripcionActualizada as PrismaInscripcionConRelaciones);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(`Error al actualizar la inscripción: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al actualizar la inscripción", 500);
    }
  }  
}
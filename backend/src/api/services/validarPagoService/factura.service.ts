import { PrismaClient } from "@prisma/client";
import {
  CreateFacturaDto,
  UpdateFacturaDto,
  FacturaResponseDto,
} from "@/api/dtos/validarPagoDto/factura.dto";
import { NotFoundError, ConflictError, AppError } from "@/utils/errorTypes";
import {
  toFacturaResponseDto,
  toFacturaWithRelationsResponseDto,
  type PrismaFacturaConRelaciones,
} from "@/api/services/mappers/validarPagoMapper/factura.mapper";

const prisma = new PrismaClient();

interface GetAllFacturasOptions {
  page: number;
  limit: number;
  orderBy: string;
  order: "asc" | "desc";
  includeRelations?: boolean;
}

export class FacturaService {
  // Crear una nueva factura
  async createFactura(
    facturaData: CreateFacturaDto
  ): Promise<FacturaResponseDto> {
    try {
      // 1. Validar existencia de IDs referenciados
      const inscripcionPromise = prisma.inscripcion.findUnique({
        where: { idInscripcion: facturaData.idInscripcion },
      });
      const datosFacturacionPromise = prisma.datosFacturacion.findUnique({
        where: { idFacturacion: facturaData.idFacturacion },
      });

      const [inscripcion, datosFacturacion] = await Promise.all([
        inscripcionPromise,
        datosFacturacionPromise,
      ]);

      if (!inscripcion) {
        throw new NotFoundError(
          `Inscripción con ID ${facturaData.idInscripcion}`
        );
      }
      if (!datosFacturacion) {
        throw new NotFoundError(
          `Datos de facturación con ID ${facturaData.idFacturacion}`
        );
      }

      // 2. Verificar que no exista ya una factura para esta inscripción
      const facturaExistente = await prisma.factura.findFirst({
        where: { idInscripcion: facturaData.idInscripcion },
      });
      if (facturaExistente) {
        throw new ConflictError(
          `Ya existe una factura para la inscripción con ID ${facturaData.idInscripcion}`
        );
      }

      // 3. Crear la factura
      const factura = await prisma.factura.create({
        data: {
          idInscripcion: facturaData.idInscripcion,
          idFacturacion: facturaData.idFacturacion,
          valorPagado: facturaData.valorPagado,
          verificacionPago: false, // Valor por defecto explícito
          numeroIngreso: facturaData.numeroIngreso,
          numeroFactura: facturaData.numeroFactura,
        },
      });

      return toFacturaResponseDto(factura);
    } catch (error: any) {
      // Manejar errores de unicidad de Prisma
      if (error.code === "P2002") {
        if (error.meta?.target?.includes("numeroIngreso")) {
          throw new ConflictError(
            `El número de ingreso ${facturaData.numeroIngreso} ya está en uso`
          );
        }
        if (error.meta?.target?.includes("numeroFactura")) {
          throw new ConflictError(
            `El número de factura ${facturaData.numeroFactura} ya está en uso`
          );
        }
      }

      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(`Error al crear la factura: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al crear la factura", 500);
    }
  }

  // Obtener todas las facturas
  async getAllFacturas(
    options: GetAllFacturasOptions
  ): Promise<{ facturas: FacturaResponseDto[]; total: number }> {
    try {
      const { page, limit, orderBy, order, includeRelations = false } = options;
      const skip = (page - 1) * limit;

      if (includeRelations) {
        const [facturas, total] = await Promise.all([
          prisma.factura.findMany({
            skip,
            take: limit,
            orderBy: {
              [orderBy]: order,
            },
            include: {
              inscripcion: {
                include: {
                  curso: true,
                  persona: true,
                },
              },
              datosFacturacion: true,
            },
          }),
          prisma.factura.count(),
        ]);

        return {
          facturas: facturas.map((factura) =>
            toFacturaWithRelationsResponseDto(
              factura as PrismaFacturaConRelaciones
            )
          ),
          total,
        };
      } else {
        const [facturas, total] = await Promise.all([
          prisma.factura.findMany({
            skip,
            take: limit,
            orderBy: {
              [orderBy]: order,
            },
          }),
          prisma.factura.count(),
        ]);

        return {
          facturas: facturas.map((factura) => toFacturaResponseDto(factura)),
          total,
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          `Error al obtener las facturas: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al obtener las facturas", 500);
    }
  }

  // Obtener una factura por ID
  async getFacturaById(
    id: number,
    includeRelations: boolean = false
  ): Promise<FacturaResponseDto> {
    try {
      if (includeRelations) {
        const factura = await prisma.factura.findUnique({
          where: { idFactura: id },
          include: {
            inscripcion: {
              include: {
                curso: true,
                persona: true,
              },
            },
            datosFacturacion: true,
          },
        });

        if (!factura) {
          throw new NotFoundError(`Factura con ID ${id}`);
        }

        return toFacturaWithRelationsResponseDto(
          factura as PrismaFacturaConRelaciones
        );
      } else {
        const factura = await prisma.factura.findUnique({
          where: { idFactura: id },
        });

        if (!factura) {
          throw new NotFoundError(`Factura con ID ${id}`);
        }

        return toFacturaResponseDto(factura);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(
          `Error al obtener la factura: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al obtener la factura", 500);
    }
  }

  // Obtener factura por número de factura
  async getFacturaByNumeroFactura(
    numeroFactura: string
  ): Promise<FacturaResponseDto> {
    try {
      const factura = await prisma.factura.findUnique({
        where: { numeroFactura },
        include: {
          inscripcion: {
            include: {
              curso: true,
              persona: true,
            },
          },
          datosFacturacion: true,
        },
      });

      if (!factura) {
        throw new NotFoundError(`Factura con número ${numeroFactura}`);
      }

      return toFacturaWithRelationsResponseDto(
        factura as PrismaFacturaConRelaciones
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(
          `Error al obtener la factura: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al obtener la factura", 500);
    }
  }

  // Obtener factura por número de ingreso
  async getFacturaByNumeroIngreso(
    numeroIngreso: string
  ): Promise<FacturaResponseDto> {
    try {
      const factura = await prisma.factura.findUnique({
        where: { numeroIngreso },
        include: {
          inscripcion: {
            include: {
              curso: true,
              persona: true,
            },
          },
          datosFacturacion: true,
        },
      });

      if (!factura) {
        throw new NotFoundError(
          `Factura con número de ingreso ${numeroIngreso}`
        );
      }

      return toFacturaWithRelationsResponseDto(
        factura as PrismaFacturaConRelaciones
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(
          `Error al obtener la factura: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al obtener la factura", 500);
    }
  }

  // Obtener facturas por ID de inscripción
  async getFacturasByInscripcionId(
    idInscripcion: number
  ): Promise<FacturaResponseDto[]> {
    try {
      const facturas = await prisma.factura.findMany({
        where: { idInscripcion },
        include: {
          inscripcion: {
            include: {
              curso: true,
              persona: true,
            },
          },
          datosFacturacion: true,
        },
      });

      return facturas.map((factura) =>
        toFacturaWithRelationsResponseDto(factura as PrismaFacturaConRelaciones)
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          `Error al obtener las facturas: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al obtener las facturas", 500);
    }
  }

  // Verificar pago de una factura
  async verificarPago(id: number): Promise<FacturaResponseDto> {
    try {
      const facturaExistente = await prisma.factura.findUnique({
        where: { idFactura: id },
      });

      if (!facturaExistente) {
        throw new NotFoundError(`Factura con ID ${id}`);
      }

      if (facturaExistente.verificacionPago) {
        throw new ConflictError(`La factura con ID ${id} ya está verificada`);
      }

      const updateData: UpdateFacturaDto = {
        verificacionPago: true,
      };

      const factura = await prisma.factura.update({
        where: { idFactura: id },
        data: updateData,
      });

      return toFacturaResponseDto(factura);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(`Error al verificar el pago: ${error.message}`, 500);
      }
      throw new AppError("Error desconocido al verificar el pago", 500);
    }
  }

  // Eliminar una factura
  async deleteFactura(id: number): Promise<FacturaResponseDto> {
    try {
      // Verificar si la factura existe
      const facturaExistente = await prisma.factura.findUnique({
        where: { idFactura: id },
      });

      if (!facturaExistente) {
        throw new NotFoundError(`Factura con ID ${id}`);
      }

      // Verificar si la factura ya está verificada
      if (facturaExistente.verificacionPago) {
        throw new ConflictError(
          `La factura con ID ${id} no puede ser eliminada porque ya está verificada`
        );
      }

      // Eliminar la factura
      const facturaEliminada = await prisma.factura.delete({
        where: { idFactura: id },
      });

      return toFacturaResponseDto(facturaEliminada);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(
          `Error al eliminar la factura: ${error.message}`,
          500
        );
      }
      throw new AppError("Error desconocido al eliminar la factura", 500);
    }
  }
}

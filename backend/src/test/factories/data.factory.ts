import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateCursoDto } from '@/api/dtos/cursoDto/curso.dto';
import { CreateDatosPersonalesDto } from '@/api/dtos/inscripcionDto/datosPersonales.dto';
import { CreateDatosFacturacionDto } from '@/api/dtos/inscripcionDto/datosFacturacion.dto';
import { CreateDescuentoDto } from '@/api/dtos/validarPagoDto/descuento.dto';

const prisma = new PrismaClient();

/**
 * Create a test course
 */
export async function createTestCourse(overrides: Partial<CreateCursoDto> = {}): Promise<any> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const courseData: CreateCursoDto = {
    nombreCortoCurso: 'TEST-101',
    nombreCurso: 'Curso de Prueba',
    modalidadCurso: 'Virtual',
    descripcionCurso: 'Curso creado para pruebas de integración',
    valorCurso: new Decimal(100.00),
    fechaInicioCurso: tomorrow.toISOString().split('T')[0],
    fechaFinCurso: nextMonth.toISOString().split('T')[0],
    ...overrides,
  };

  return await prisma.curso.create({
    data: {
      nombreCortoCurso: courseData.nombreCortoCurso,
      nombreCurso: courseData.nombreCurso,
      modalidadCurso: courseData.modalidadCurso,
      descripcionCurso: courseData.descripcionCurso,
      valorCurso: courseData.valorCurso,
      fechaInicioCurso: new Date(courseData.fechaInicioCurso),
      fechaFinCurso: new Date(courseData.fechaFinCurso),
    },
  });
}

/**
 * Create test personal data
 */
export async function createTestPersonalData(overrides: Partial<CreateDatosPersonalesDto> = {}): Promise<any> {
  const personalData: CreateDatosPersonalesDto = {
    ciPasaporte: '1234567890',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez González',
    numTelefono: '0987654321',
    correo: 'juan.perez@test.com',
    pais: 'Ecuador',
    provinciaEstado: 'Pichincha',
    ciudad: 'Quito',
    profesion: 'Ingeniero',
    institucion: 'Universidad Test',
    ...overrides,
  };

  return await prisma.datosPersonales.create({
    data: personalData,
  });
}

/**
 * Create test billing data
 */
export async function createTestBillingData(overrides: Partial<CreateDatosFacturacionDto> = {}): Promise<any> {
  const billingData: CreateDatosFacturacionDto = {
    razonSocial: 'Empresa Test S.A.',
    identificacionTributaria: '1234567890001',
    telefono: '023456789',
    correoFactura: 'facturacion@test.com',
    direccion: 'Av. Test 123 y Calle Prueba',
    ...overrides,
  };

  return await prisma.datosFacturacion.create({
    data: billingData,
  });
}

/**
 * Create test discount
 */
export async function createTestDiscount(overrides: Partial<CreateDescuentoDto> = {}): Promise<any> {
  const discountData: CreateDescuentoDto = {
    tipoDescuento: 'Estudiante',
    valorDescuento: new Decimal(10.00),
    porcentajeDescuento: new Decimal(10.00),
    descripcionDescuento: 'Descuento para estudiantes',
    ...overrides,
  };

  return await prisma.descuento.create({
    data: discountData,
  });
}

/**
 * Create test voucher/comprobante
 */
export async function createTestVoucher(overrides: any = {}): Promise<any> {
  const voucherData = {
    fechaSubida: new Date(),
    rutaComprobante: '/test/path/voucher.pdf',
    tipoArchivo: 'application/pdf',
    nombreArchivo: 'test-voucher.pdf',
    ...overrides,
  };

  return await prisma.comprobante.create({
    data: voucherData,
  });
}

/**
 * Create complete inscription data
 */
export async function createCompleteInscriptionData() {
  const course = await createTestCourse();
  const personalData = await createTestPersonalData();
  const billingData = await createTestBillingData();
  const voucher = await createTestVoucher();
  const discount = await createTestDiscount();

  return {
    course,
    personalData,
    billingData,
    voucher,
    discount,
  };
}

/**
 * Create test inscription
 */
export async function createTestInscription(
  courseId: number,
  personalDataId: number,
  billingDataId: number,
  voucherId: number,
  discountId?: number
): Promise<any> {
  return await prisma.inscripcion.create({
    data: {
      idCurso: courseId,
      idPersona: personalDataId,
      idFacturacion: billingDataId,
      idComprobante: voucherId,
      idDescuento: discountId ?? null,
      matricula: false,
      fechaInscripcion: new Date(),
    },
  });
}

/**
 * Create test invoice/factura
 */
export async function createTestInvoice(
  inscriptionId: number,
  billingDataId: number,
  overrides: any = {}
): Promise<any> {
  const invoiceData = {
    idInscripcion: inscriptionId,
    idFacturacion: billingDataId,
    valorPagado: 100.00,
    verificacionPago: false,
    numeroIngreso: `ING-${Date.now()}`,
    numeroFactura: `FAC-${Date.now()}`,
    ...overrides,
  };

  return await prisma.factura.create({
    data: invoiceData,
  });
}

/**
 * Generate unique identifiers for test data
 */
export function generateUniqueId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

/**
 * Generate unique email for testing
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  return `${prefix}-${generateUniqueId()}@test.com`;
}

/**
 * Generate unique CI for testing
 */
export function generateUniqueCI(): string {
  const base = '123456789';
  const suffix = Math.floor(Math.random() * 10).toString();
  return base + suffix;
}

/**
 * Generate unique RUC for testing
 */
export function generateUniqueRUC(): string {
  const base = '123456789000';
  const suffix = Math.floor(Math.random() * 10).toString();
  return base + suffix;
}
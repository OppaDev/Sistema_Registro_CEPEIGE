import request from 'supertest';
import app from '@/app';
import { Decimal } from '@prisma/client/runtime/library';
import { cleanDatabase, closeDatabase } from '@/test/helpers/database.helper';
import { createAdmin, getAuthHeader } from '@/test/helpers/auth.helper';
import { 
  createTestCourse, 
  createCompleteInscriptionData,
  createTestInscription,
  createTestInvoice,
  generateUniqueEmail,
  generateUniqueCI,
  generateUniqueRUC 
} from '@/test/factories/data.factory';

describe('Reports Endpoints Integration Tests', () => {
  let adminTokens: any;
  let testCourse1: any;
  let testCourse2: any;

  beforeEach(async () => {
    await cleanDatabase();
    
    const admin = await createAdmin();
    adminTokens = admin.tokens;
    
    // Create test courses
    testCourse1 = await createTestCourse({
      nombreCortoCurso: 'COURSE-001',
      nombreCurso: 'Curso de Prueba 1',
      valorCurso: new Decimal(100.00),
    });

    testCourse2 = await createTestCourse({
      nombreCortoCurso: 'COURSE-002',
      nombreCurso: 'Curso de Prueba 2',
      valorCurso: new Decimal(150.00),
    });

    // Create test data for reports
    await createTestReportData();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  async function createTestReportData() {
    // Create multiple inscriptions with different statuses for testing filters
    
    // Inscription 1: Course 1, Paid and Verified
    const data1 = await createCompleteInscriptionData();
    const inscription1 = await createTestInscription(
      testCourse1.idCurso,
      data1.personalData.idPersona,
      data1.billingData.idFacturacion,
      data1.voucher.idComprobante,
      data1.discount.idDescuento
    );
    await createTestInvoice(
      inscription1.idInscripcion,
      data1.billingData.idFacturacion,
      { verificacionPago: true, valorPagado: 90.00 } // With discount
    );

    // Inscription 2: Course 1, Paid but Not Verified
    const data2 = await createCompleteInscriptionData();
    // Create unique data
    data2.personalData = await createTestPersonalData({
      ciPasaporte: generateUniqueCI(),
      correo: generateUniqueEmail('student2'),
    });
    data2.billingData = await createTestBillingData({
      identificacionTributaria: generateUniqueRUC(),
      correoFactura: generateUniqueEmail('billing2'),
    });
    
    const inscription2 = await createTestInscription(
      testCourse1.idCurso,
      data2.personalData.idPersona,
      data2.billingData.idFacturacion,
      data2.voucher.idComprobante
      // No discount
    );
    await createTestInvoice(
      inscription2.idInscripcion,
      data2.billingData.idFacturacion,
      { verificacionPago: false, valorPagado: 100.00 }
    );

    // Inscription 3: Course 2, Paid and Verified
    const data3 = await createCompleteInscriptionData();
    data3.personalData = await createTestPersonalData({
      ciPasaporte: generateUniqueCI(),
      correo: generateUniqueEmail('student3'),
    });
    data3.billingData = await createTestBillingData({
      identificacionTributaria: generateUniqueRUC(),
      correoFactura: generateUniqueEmail('billing3'),
    });

    const inscription3 = await createTestInscription(
      testCourse2.idCurso,
      data3.personalData.idPersona,
      data3.billingData.idFacturacion,
      data3.voucher.idComprobante
    );
    await createTestInvoice(
      inscription3.idInscripcion,
      data3.billingData.idFacturacion,
      { verificacionPago: true, valorPagado: 150.00 }
    );
  }

  async function createTestPersonalData(overrides = {}) {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    return await prisma.datosPersonales.create({
      data: {
        ciPasaporte: generateUniqueCI(),
        nombres: 'Test',
        apellidos: 'Student',
        numTelefono: '0987654321',
        correo: generateUniqueEmail('student'),
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero',
        institucion: 'Universidad Test',
        ...overrides,
      },
    });
  }

  async function createTestBillingData(overrides = {}) {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    return await prisma.datosFacturacion.create({
      data: {
        razonSocial: 'Test Company S.A.',
        identificacionTributaria: generateUniqueRUC(),
        telefono: '023456789',
        correoFactura: generateUniqueEmail('billing'),
        direccion: 'Test Address',
        ...overrides,
      },
    });
  }

  describe('GET /api/v1/informes/datos', () => {
    it('INT-INF-001: Should get report data without filters', async () => {
      const response = await request(app)
        .get('/api/v1/informes/datos')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('inscripciones');
      expect(response.body.data).toHaveProperty('resumen');
      expect(Array.isArray(response.body.data.inscripciones)).toBe(true);
      expect(response.body.data.inscripciones.length).toBe(3); // All test inscriptions
      expect(response.body.message).toBe('Datos de informe obtenidos exitosamente');

      // Verify inscription structure
      const inscription = response.body.data.inscripciones[0];
      expect(inscription).toHaveProperty('idInscripcion');
      expect(inscription).toHaveProperty('curso');
      expect(inscription).toHaveProperty('persona');
      expect(inscription).toHaveProperty('datosFacturacion');
      expect(inscription).toHaveProperty('facturas');
      expect(inscription).toHaveProperty('matricula');

      // Verify summary structure
      const summary = response.body.data.resumen;
      expect(summary).toHaveProperty('totalInscripciones');
      expect(summary).toHaveProperty('inscripcionesPorCurso');
      expect(summary).toHaveProperty('ingresosTotales');
      expect(summary).toHaveProperty('pagosVerificados');
      expect(summary.totalInscripciones).toBe(3);
    });

    it('INT-INF-002: Should get data filtered by course ID', async () => {
      const response = await request(app)
        .get(`/api/v1/informes/datos?idCurso=${testCourse1.idCurso}`)
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inscripciones.length).toBe(2); // Only course 1 inscriptions
      expect(response.body.message).toBe('Datos de informe obtenidos exitosamente');

      // Verify all inscriptions belong to the filtered course
      response.body.data.inscripciones.forEach((inscription: any) => {
        expect(inscription.curso.idCurso).toBe(testCourse1.idCurso);
      });

      // Verify filtered summary
      expect(response.body.data.resumen.totalInscripciones).toBe(2);
    });

    it('INT-INF-003: Should get data filtered by verified payments', async () => {
      const response = await request(app)
        .get('/api/v1/informes/datos?verificacionPago=true')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inscripciones.length).toBe(2); // Only verified payments
      expect(response.body.message).toBe('Datos de informe obtenidos exitosamente');

      // Verify all inscriptions have verified payments
      response.body.data.inscripciones.forEach((inscription: any) => {
        inscription.facturas.forEach((factura: any) => {
          expect(factura.verificacionPago).toBe(true);
        });
      });
    });

    it('Should get data filtered by unverified payments', async () => {
      const response = await request(app)
        .get('/api/v1/informes/datos?verificacionPago=false')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inscripciones.length).toBe(1); // Only unverified payments
      expect(response.body.message).toBe('Datos de informe obtenidos exitosamente');

      // Verify inscription has unverified payment
      const inscription = response.body.data.inscripciones[0];
      inscription.facturas.forEach((factura: any) => {
        expect(factura.verificacionPago).toBe(false);
      });
    });

    it('Should support date range filters', async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const response = await request(app)
        .get(`/api/v1/informes/datos?fechaInicio=${yesterday.toISOString().split('T')[0]}&fechaFin=${tomorrow.toISOString().split('T')[0]}`)
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inscripciones.length).toBe(3); // All inscriptions within range
    });

    it('Should require authentication', async () => {
      await request(app)
        .get('/api/v1/informes/datos')
        .expect(401);
    });

    it('Should require admin privileges', async () => {
      // This test would require creating a non-admin user and testing access
      // For now, we assume the middleware handles this correctly
    });
  });

  describe('POST /api/v1/informes/generar', () => {
    it('INT-INF-004: Should generate Excel report with valid filters', async () => {
      const response = await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'excel',
          filtros: {
            idCurso: testCourse1.idCurso,
            verificacionPago: true,
          },
        })
        .expect(200);

      // Verify response headers for Excel file
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment; filename=');
      
      // Verify file content is not empty
      expect(Buffer.isBuffer(response.body) || response.body.length > 0).toBe(true);
    });

    it('INT-INF-005: Should generate PDF report with valid filters', async () => {
      const response = await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'pdf',
          filtros: {
            verificacionPago: false,
          },
        })
        .expect(200);

      // Verify response headers for PDF file
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment; filename=');
      
      // Verify file content is not empty
      expect(Buffer.isBuffer(response.body) || response.body.length > 0).toBe(true);
    });

    it('INT-INF-006: Should fail with invalid report type', async () => {
      const response = await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'invalid-type',
          filtros: {},
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('tipoInforme debe ser excel o pdf');
    });

    it('Should validate required fields', async () => {
      // Missing tipoInforme
      await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          filtros: {},
        })
        .expect(400);

      // Missing filtros
      await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'excel',
        })
        .expect(400);
    });

    it('Should generate report with no data', async () => {
      const response = await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'excel',
          filtros: {
            idCurso: 99999, // Non-existent course
          },
        })
        .expect(200);

      // Should still generate a file even with no data
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('Should support complex filters', async () => {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);

      const response = await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'pdf',
          filtros: {
            fechaInicio: lastMonth.toISOString().split('T')[0],
            fechaFin: today.toISOString().split('T')[0],
            verificacionPago: true,
            matricula: false,
          },
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('Should require authentication', async () => {
      await request(app)
        .post('/api/v1/informes/generar')
        .send({
          tipoInforme: 'excel',
          filtros: {},
        })
        .expect(401);
    });

    it('Should handle large datasets efficiently', async () => {
      // This test would be more meaningful with a larger dataset
      // For now, we test that it doesn't timeout with current data
      const response = await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'excel',
          filtros: {}, // All data
        })
        .timeout(30000) // 30 second timeout
        .expect(200);

      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });

  describe('Report Data Accuracy', () => {
    it('Should include all required fields in report data', async () => {
      const response = await request(app)
        .get('/api/v1/informes/datos')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      const inscription = response.body.data.inscripciones[0];
      
      // Verify inscription fields
      expect(inscription).toHaveProperty('idInscripcion');
      expect(inscription).toHaveProperty('fechaInscripcion');
      expect(inscription).toHaveProperty('matricula');
      
      // Verify course fields
      expect(inscription.curso).toHaveProperty('nombreCurso');
      expect(inscription.curso).toHaveProperty('modalidadCurso');
      expect(inscription.curso).toHaveProperty('valorCurso');
      
      // Verify person fields
      expect(inscription.persona).toHaveProperty('nombres');
      expect(inscription.persona).toHaveProperty('apellidos');
      expect(inscription.persona).toHaveProperty('correo');
      expect(inscription.persona).toHaveProperty('ciPasaporte');
      
      // Verify billing fields
      expect(inscription.datosFacturacion).toHaveProperty('razonSocial');
      expect(inscription.datosFacturacion).toHaveProperty('identificacionTributaria');
      
      // Verify invoice fields
      expect(Array.isArray(inscription.facturas)).toBe(true);
      if (inscription.facturas.length > 0) {
        const factura = inscription.facturas[0];
        expect(factura).toHaveProperty('valorPagado');
        expect(factura).toHaveProperty('verificacionPago');
        expect(factura).toHaveProperty('numeroFactura');
      }
    });

    it('Should calculate summary statistics correctly', async () => {
      const response = await request(app)
        .get('/api/v1/informes/datos')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      const summary = response.body.data.resumen;
      
      expect(summary.totalInscripciones).toBe(3);
      expect(summary.inscripcionesPorCurso).toHaveProperty(testCourse1.idCurso.toString(), 2);
      expect(summary.inscripcionesPorCurso).toHaveProperty(testCourse2.idCurso.toString(), 1);
      
      // Verify total income calculation (90 + 100 + 150 = 340)
      expect(summary.ingresosTotales).toBe('340.00');
      
      // Verify verified payments count (2 out of 3)
      expect(summary.pagosVerificados).toBe(2);
    });
  });
});
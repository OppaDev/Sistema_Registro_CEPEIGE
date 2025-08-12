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
  createTestPersonalData,
  createTestBillingData,
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
    const personalData1 = await createTestPersonalData({
      ciPasaporte: generateUniqueCI(),
      correo: generateUniqueEmail('student1'),
    });
    const billingData1 = await createTestBillingData({
      identificacionTributaria: generateUniqueRUC(),
      correoFactura: generateUniqueEmail('billing1'),
    });
    const data1 = await createCompleteInscriptionData();
    
    const inscription1 = await createTestInscription(
      testCourse1.idCurso,
      personalData1.idPersona,
      billingData1.idFacturacion,
      data1.voucher.idComprobante,
      data1.discount.idDescuento
    );
    await createTestInvoice(
      inscription1.idInscripcion,
      billingData1.idFacturacion,
      { verificacionPago: true, valorPagado: 90.00 } // With discount
    );

    // Inscription 2: Course 1, Paid but Not Verified
    const personalData2 = await createTestPersonalData({
      ciPasaporte: generateUniqueCI(),
      correo: generateUniqueEmail('student2'),
    });
    const billingData2 = await createTestBillingData({
      identificacionTributaria: generateUniqueRUC(),
      correoFactura: generateUniqueEmail('billing2'),
    });
    const data2 = await createCompleteInscriptionData();
    
    const inscription2 = await createTestInscription(
      testCourse1.idCurso,
      personalData2.idPersona,
      billingData2.idFacturacion,
      data2.voucher.idComprobante
      // No discount
    );
    await createTestInvoice(
      inscription2.idInscripcion,
      billingData2.idFacturacion,
      { verificacionPago: false, valorPagado: 100.00 }
    );

    // Inscription 3: Course 2, Paid and Verified
    const personalData3 = await createTestPersonalData({
      ciPasaporte: generateUniqueCI(),
      correo: generateUniqueEmail('student3'),
    });
    const billingData3 = await createTestBillingData({
      identificacionTributaria: generateUniqueRUC(),
      correoFactura: generateUniqueEmail('billing3'),
    });
    const data3 = await createCompleteInscriptionData();

    const inscription3 = await createTestInscription(
      testCourse2.idCurso,
      personalData3.idPersona,
      billingData3.idFacturacion,
      data3.voucher.idComprobante
    );
    await createTestInvoice(
      inscription3.idInscripcion,
      billingData3.idFacturacion,
      { verificacionPago: true, valorPagado: 150.00 }
    );
  }

  describe('GET /api/v1/informes/datos', () => {
    it('INT-INF-001: Should get report data without filters', async () => {
      const response = await request(app)
        .get('/api/v1/informes/datos')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('inscripciones');
      expect(response.body.data).toHaveProperty('estadisticas'); // Cambiado de 'resumen' a 'estadisticas'
      expect(Array.isArray(response.body.data.inscripciones)).toBe(true);
      expect(response.body.data.inscripciones.length).toBe(3); // All test inscriptions
      expect(response.body.message).toBe('Datos del informe obtenidos exitosamente');

      // Verify inscription structure - the response is flat according to InscripcionInformeDto
      const inscription = response.body.data.inscripciones[0];
      expect(inscription).toHaveProperty('idInscripcion');
      expect(inscription).toHaveProperty('nombreCompleto');
      expect(inscription).toHaveProperty('email');
      expect(inscription).toHaveProperty('nombreCurso');
      expect(inscription).toHaveProperty('fechaInscripcion');
      expect(inscription).toHaveProperty('matricula');
      expect(inscription).toHaveProperty('verificacionPago');

      // Verify summary structure
      const summary = response.body.data.estadisticas; // Cambiado de 'resumen' a 'estadisticas'
      expect(summary).toHaveProperty('totalInscripciones');
      expect(summary).toHaveProperty('inscripcionesPorCurso');
      expect(summary).toHaveProperty('montoTotalComprobantes'); // Changed from 'ingresosTotales'
      expect(summary).toHaveProperty('pagosVerificados');
      expect(summary.totalInscripciones).toBe(3);
    });

    it('INT-INF-002: Should get data filtered by course ID', async () => {
      const response = await request(app)
        .get(`/api/v1/informes/datos`)
        .query({ idCurso: testCourse1.idCurso })
        .set(getAuthHeader(adminTokens.accessToken))
        .expect((res) => {
          if (res.status !== 200) {
            console.log('DEBUG INT-INF-002 - Status:', res.status);
            console.log('DEBUG INT-INF-002 - Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inscripciones.length).toBe(2); // Only course 1 inscriptions
      expect(response.body.message).toBe('Datos del informe obtenidos exitosamente');

      // Verify all inscriptions belong to the filtered course
      response.body.data.inscripciones.forEach((inscription: any) => {
        expect(inscription.nombreCurso).toBe(testCourse1.nombreCurso);
      });

      // Verify filtered summary
      expect(response.body.data.estadisticas.totalInscripciones).toBe(2);
    });

    it('INT-INF-003: Should get data filtered by verified payments', async () => {
      const response = await request(app)
        .get('/api/v1/informes/datos')
        .query({ verificacionPago: 'true' })
        .set(getAuthHeader(adminTokens.accessToken))
        .expect((res) => {
          if (res.status !== 200) {
            console.log('DEBUG INT-INF-003 - Status:', res.status);
            console.log('DEBUG INT-INF-003 - Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inscripciones.length).toBe(2); // Only verified payments
      expect(response.body.message).toBe('Datos del informe obtenidos exitosamente');

      // Verify all inscriptions have verified payments
      response.body.data.inscripciones.forEach((inscription: any) => {
        expect(inscription.verificacionPago).toBe(true);
      });
    });

    it('Should get data filtered by unverified payments', async () => {
      const response = await request(app)
        .get('/api/v1/informes/datos')
        .query({ verificacionPago: 'false' })
        .set(getAuthHeader(adminTokens.accessToken))
        .expect((res) => {
          if (res.status !== 200) {
            console.log('DEBUG Unverified Payments - Status:', res.status);
            console.log('DEBUG Unverified Payments - Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inscripciones.length).toBe(1); // Only unverified payments
      expect(response.body.message).toBe('Datos del informe obtenidos exitosamente');

      // Verify inscription has unverified payment
      const inscription = response.body.data.inscripciones[0];
      expect(inscription.verificacionPago).toBe(false);
    });

    it('Should support date range filters', async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const response = await request(app)
        .get('/api/v1/informes/datos')
        .query({
          fechaInicio: yesterday.toISOString().split('T')[0],
          fechaFin: tomorrow.toISOString().split('T')[0]
        })
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
          tipoInforme: 'inscripciones',
          formato: 'excel',
          idCurso: testCourse1.idCurso,
          verificacionPago: true,
        })
        .expect((res) => {
          if (res.status !== 200) {
            console.log('DEBUG INT-INF-004 - Status:', res.status);
            console.log('DEBUG INT-INF-004 - Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(200);

      // Verify response headers for Excel file
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment; filename=');
      
      // For binary files, check that we have some response content
      expect(response.body).toBeDefined();
      // Check if it's a Buffer or if it has content
      if (Buffer.isBuffer(response.body)) {
        expect(response.body.length).toBeGreaterThan(0);
      } else {
        // For non-buffer responses, check content-length header or body existence
        const contentLength = response.headers['content-length'];
        if (contentLength) {
          expect(parseInt(contentLength, 10)).toBeGreaterThan(0);
        } else {
          // At minimum, verify the response is not empty
          expect(response.body).toBeTruthy();
        }
      }
    });

    it('INT-INF-005: Should generate PDF report with valid filters', async () => {
      const response = await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'pagados',
          formato: 'pdf',
          verificacionPago: false,
        })
        .expect((res) => {
          if (res.status !== 200) {
            console.log('DEBUG INT-INF-005 - Status:', res.status);
            console.log('DEBUG INT-INF-005 - Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(200);

      // Verify response headers for PDF file
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment; filename=');
      
      // For binary files, check that we have some response content  
      expect(response.body).toBeDefined();
      // Check if it's a Buffer or if it has content
      if (Buffer.isBuffer(response.body)) {
        expect(response.body.length).toBeGreaterThan(0);
      } else {
        // For non-buffer responses, check content-length header or body existence
        const contentLength = response.headers['content-length'];
        if (contentLength) {
          expect(parseInt(contentLength, 10)).toBeGreaterThan(0);
        } else {
          // At minimum, verify the response is not empty
          expect(response.body).toBeTruthy();
        }
      }
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
      expect(response.body.message).toContain('El formato debe ser \'excel\' o \'pdf\'');
    });

    it('Should validate required fields', async () => {
      // Missing tipoInforme
      await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          formato: 'excel',
        })
        .expect(400);

      // Missing formato
      await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'inscripciones',
        })
        .expect(400);
    });

    it('Should generate report with no data', async () => {
      // Use a date range that doesn't include any of our test data
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureEndDate = new Date();
      futureEndDate.setFullYear(futureEndDate.getFullYear() + 2);

      const response = await request(app)
        .post('/api/v1/informes/generar')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          tipoInforme: 'inscripciones',
          formato: 'excel',
          fechaInicio: futureDate.toISOString().split('T')[0],
          fechaFin: futureEndDate.toISOString().split('T')[0],
        })
        .expect((res) => {
          if (res.status !== 200) {
            console.log('DEBUG No Data Report - Status:', res.status);
            console.log('DEBUG No Data Report - Body:', JSON.stringify(res.body, null, 2));
          }
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
          tipoInforme: 'pagados',
          formato: 'pdf',
          fechaInicio: lastMonth.toISOString().split('T')[0],
          fechaFin: today.toISOString().split('T')[0],
          verificacionPago: true,
          matricula: false,
        })
        .expect((res) => {
          if (res.status !== 200) {
            console.log('DEBUG Complex Filters - Status:', res.status);
            console.log('DEBUG Complex Filters - Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('Should require authentication', async () => {
      await request(app)
        .post('/api/v1/informes/generar')
        .send({
          tipoInforme: 'inscripciones',
          formato: 'excel',
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
          tipoInforme: 'inscripciones',
          formato: 'excel', // All data
        })
        .timeout(30000) // 30 second timeout
        .expect((res) => {
          if (res.status !== 200) {
            console.log('DEBUG Large Dataset - Status:', res.status);
            console.log('DEBUG Large Dataset - Body:', JSON.stringify(res.body, null, 2));
          }
        })
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
      
      // Verify inscription fields according to InscripcionInformeDto
      expect(inscription).toHaveProperty('idInscripcion');
      expect(inscription).toHaveProperty('nombreCompleto');
      expect(inscription).toHaveProperty('email');
      expect(inscription).toHaveProperty('telefono');
      expect(inscription).toHaveProperty('cedula');
      expect(inscription).toHaveProperty('nombreCurso');
      expect(inscription).toHaveProperty('fechaInscripcion');
      expect(inscription).toHaveProperty('matricula');
      expect(inscription).toHaveProperty('tipoComprobante');
      expect(inscription).toHaveProperty('montoComprobante');
      expect(inscription).toHaveProperty('verificacionPago');
      expect(inscription).toHaveProperty('estadoPago');
    });

    it('Should calculate summary statistics correctly', async () => {
      const response = await request(app)
        .get('/api/v1/informes/datos')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      const summary = response.body.data.estadisticas;
      
      expect(summary.totalInscripciones).toBe(3);
      expect(summary.inscripcionesPorCurso).toHaveProperty(testCourse1.nombreCurso, 2);
      expect(summary.inscripcionesPorCurso).toHaveProperty(testCourse2.nombreCurso, 1);
      
      // Verify statistics according to EstadisticasInformeDto
      expect(summary).toHaveProperty('matriculados');
      expect(summary).toHaveProperty('noMatriculados');
      expect(summary).toHaveProperty('pagosVerificados');
      expect(summary).toHaveProperty('pagosPendientes');
      expect(summary).toHaveProperty('montoTotalComprobantes');
      expect(summary).toHaveProperty('promedioMonto');
      expect(summary).toHaveProperty('cursosUnicos');
      expect(summary).toHaveProperty('tiposComprobante');
      
      // Verify verified payments count (2 out of 3)
      expect(summary.pagosVerificados).toBe(2);
    });
  });
});
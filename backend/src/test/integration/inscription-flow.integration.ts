import request from 'supertest';
import app from '@/app';
import { cleanDatabase, closeDatabase } from '@/test/helpers/database.helper';
import { createAdmin, createContador, getAuthHeader } from '@/test/helpers/auth.helper';
import { createTestCourse, generateUniqueEmail, generateUniqueCI, generateUniqueRUC } from '@/test/factories/data.factory';
import path from 'path';
import fs from 'fs';

// Helper function to create a test file for voucher upload
function createTestFile(): string {
  const testDir = path.join(__dirname, '..', 'fixtures');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const testFilePath = path.join(testDir, 'test-voucher.pdf');
  
  // Create a minimal PDF file for testing
  const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000079 00000 n \n0000000173 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n284\n%%EOF');
  
  fs.writeFileSync(testFilePath, pdfContent);
  return testFilePath;
}

describe('Complete Inscription Flow Integration Tests', () => {
  let testCourse: any;
  let adminTokens: any;
  let contadorTokens: any;

  beforeEach(async () => {
    await cleanDatabase();
    
    // Create test course and admin for each test
    testCourse = await createTestCourse();
    const admin = await createAdmin();
    adminTokens = admin.tokens;
    
    const contador = await createContador();
    contadorTokens = contador.tokens;
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe('Complete Inscription Flow', () => {
    it('INT-FLOW-001 to INT-FLOW-007: Complete inscription and payment verification flow', async () => {
      let personalDataId: number;
      let billingDataId: number;
      let voucherId: number;
      let inscriptionId: number;
      let invoiceId: number;

      // Step 1: INT-FLOW-001 - Create personal data
      const personalDataResponse = await request(app)
        .post('/api/v1/datos-personales')
        .send({
          ciPasaporte: generateUniqueCI(),
          nombres: 'Juan Carlos',
          apellidos: 'Pérez González',
          numTelefono: '0987654321',
          correo: generateUniqueEmail('juan.perez'),
          pais: 'Ecuador',
          provinciaEstado: 'Pichincha',
          ciudad: 'Quito',
          profesion: 'Ingeniero',
          institucion: 'Universidad Test',
        })
        .expect((res) => {
          if (res.status !== 201) {
            console.log('DEBUG Personal Data Creation - Status:', res.status);
            console.log('DEBUG Personal Data Creation - Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(201);

      expect(personalDataResponse.body.success).toBe(true);
      expect(personalDataResponse.body.data).toHaveProperty('idPersona');
      expect(personalDataResponse.body.message).toBe('Datos personales creados exitosamente');
      
      personalDataId = personalDataResponse.body.data.idPersona;

      // Step 2: INT-FLOW-002 - Create billing data
      const billingDataResponse = await request(app)
        .post('/api/v1/datos-facturacion')
        .send({
          razonSocial: 'Empresa Test S.A.',
          identificacionTributaria: generateUniqueRUC(),
          telefono: '023456789',
          correoFactura: generateUniqueEmail('facturacion'),
          direccion: 'Av. Test 123 y Calle Prueba',
        })
        .expect(201);

      expect(billingDataResponse.body.success).toBe(true);
      expect(billingDataResponse.body.data).toHaveProperty('idFacturacion');
      expect(billingDataResponse.body.message).toBe('Datos de facturación creados exitosamente');
      
      billingDataId = billingDataResponse.body.data.idFacturacion;

      // Step 3: INT-FLOW-003 - Upload voucher (simulate file upload)
      const testFilePath = createTestFile();
      const voucherResponse = await request(app)
        .post('/api/v1/comprobantes')
        .attach('comprobanteFile', testFilePath) // Use the correct field name from multer
        .expect(201);

      expect(voucherResponse.body.success).toBe(true);
      expect(voucherResponse.body.data).toHaveProperty('idComprobante');
      expect(voucherResponse.body.message).toBe('Comprobante subido y creado exitosamente.');
      
      voucherId = voucherResponse.body.data.idComprobante;

      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }

      // Step 4: INT-FLOW-004 - Create inscription
      const inscriptionResponse = await request(app)
        .post('/api/v1/inscripciones')
        .send({
          idCurso: testCourse.idCurso,
          idPersona: personalDataId,
          idFacturacion: billingDataId,
          idComprobante: voucherId,
          // idDescuento is optional
        })
        .expect(201);

      expect(inscriptionResponse.body.success).toBe(true);
      expect(inscriptionResponse.body.data).toHaveProperty('idInscripcion');
      expect(inscriptionResponse.body.data).toHaveProperty('curso');
      expect(inscriptionResponse.body.data).toHaveProperty('datosPersonales');
      expect(inscriptionResponse.body.data).toHaveProperty('datosFacturacion');
      expect(inscriptionResponse.body.data).toHaveProperty('comprobante');
      expect(inscriptionResponse.body.data.curso.idCurso).toBe(testCourse.idCurso);
      expect(inscriptionResponse.body.data.datosPersonales.idPersona).toBe(personalDataId);
      expect(inscriptionResponse.body.data.datosFacturacion.idFacturacion).toBe(billingDataId);
      expect(inscriptionResponse.body.data.comprobante.idComprobante).toBe(voucherId);
      expect(inscriptionResponse.body.message).toBe('Inscripción creada exitosamente');
      
      inscriptionId = inscriptionResponse.body.data.idInscripcion;

      // Step 5: INT-FLOW-005 - Contador creates invoice
      const invoiceResponse = await request(app)
        .post('/api/v1/facturas')
        .set(getAuthHeader(contadorTokens.accessToken))
        .send({
          idInscripcion: inscriptionId,
          idFacturacion: billingDataId,
          valorPagado: 100.00,
          numeroIngreso: `ING-${Date.now()}`,
          numeroFactura: `FAC-${Date.now()}`,
        })
        .expect(201);

      expect(invoiceResponse.body.success).toBe(true);
      expect(invoiceResponse.body.data).toHaveProperty('idFactura');
      expect(invoiceResponse.body.data).toHaveProperty('idInscripcion', inscriptionId);
      expect(invoiceResponse.body.data).toHaveProperty('valorPagado', '100');
      expect(invoiceResponse.body.data).toHaveProperty('verificacionPago', false);
      expect(invoiceResponse.body.message).toBe('Factura creada exitosamente');
      
      invoiceId = invoiceResponse.body.data.idFactura;

      // Step 6: INT-FLOW-006 - Admin/Contador verifies payment
      const verifyPaymentResponse = await request(app)
        .patch(`/api/v1/facturas/${invoiceId}/verificar-pago`)
        .set(getAuthHeader(contadorTokens.accessToken))
        .expect(200);

      expect(verifyPaymentResponse.body.success).toBe(true);
      expect(verifyPaymentResponse.body.data).toHaveProperty('verificacionPago', true);
      expect(verifyPaymentResponse.body.message).toBe('Pago verificado exitosamente');

      // Step 7: INT-FLOW-007 - Admin enrolls student (matricula: true)
      const enrollResponse = await request(app)
        .put(`/api/v1/inscripciones/${inscriptionId}`)
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          matricula: true,
        })
        .expect((res) => {
          if (res.status !== 200) {
            console.log('DEBUG Enrollment - Status:', res.status);
            console.log('DEBUG Enrollment - Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(200);

      expect(enrollResponse.body.success).toBe(true);
      expect(enrollResponse.body.data).toHaveProperty('matricula', true);
      expect(enrollResponse.body.message).toBe('Inscripción actualizada exitosamente');

      // Verify complete flow by getting inscription with all relations
      const finalInscriptionResponse = await request(app)
        .get(`/api/v1/inscripciones/${inscriptionId}`)
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(finalInscriptionResponse.body.success).toBe(true);
      const finalInscription = finalInscriptionResponse.body.data;
      expect(finalInscription).toHaveProperty('matricula', true);
      expect(finalInscription).toHaveProperty('curso');
      expect(finalInscription).toHaveProperty('datosPersonales');
      expect(finalInscription).toHaveProperty('datosFacturacion');
      expect(finalInscription).toHaveProperty('comprobante');
      
      // Verify associated invoice is paid
      const finalInvoiceResponse = await request(app)
        .get(`/api/v1/facturas/${invoiceId}`)
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(finalInvoiceResponse.body.data).toHaveProperty('verificacionPago', true);
    });
  });

  describe('Inscription Flow Error Cases', () => {
    it('Should fail creating inscription with non-existent course', async () => {
      // Create personal data first
      const personalDataResponse = await request(app)
        .post('/api/v1/datos-personales')
        .send({
          ciPasaporte: generateUniqueCI(),
          nombres: 'Test',
          apellidos: 'User',
          numTelefono: '0987654321',
          correo: generateUniqueEmail(),
          pais: 'Ecuador',
          provinciaEstado: 'Pichincha',
          ciudad: 'Quito',
          profesion: 'Ingeniero',
          institucion: 'Universidad Test',
        })
        .expect((res) => {
          if (res.status !== 201) {
            console.log('DEBUG Non-existent Course Personal Data - Status:', res.status);
            console.log('DEBUG Non-existent Course Personal Data - Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(201);

      const billingDataResponse = await request(app)
        .post('/api/v1/datos-facturacion')
        .send({
          razonSocial: 'Empresa Test S.A.',
          identificacionTributaria: generateUniqueRUC(),
          telefono: '023456789',
          correoFactura: generateUniqueEmail('billing'),
          direccion: 'Test Address',
        })
        .expect(201);

      const testFilePath = createTestFile();
      const voucherResponse = await request(app)
        .post('/api/v1/comprobantes')
        .attach('comprobanteFile', testFilePath)
        .expect(201);

      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }

      // Try to create inscription with non-existent course
      await request(app)
        .post('/api/v1/inscripciones')
        .send({
          idCurso: 99999, // Non-existent course
          idPersona: personalDataResponse.body.data.idPersona,
          idFacturacion: billingDataResponse.body.data.idFacturacion,
          idComprobante: voucherResponse.body.data.idComprobante,
        })
        .expect(404);
    });

    it('Should fail creating invoice with non-existent inscription', async () => {
      const billingDataResponse = await request(app)
        .post('/api/v1/datos-facturacion')
        .send({
          razonSocial: 'Empresa Test S.A.',
          identificacionTributaria: generateUniqueRUC(),
          telefono: '023456789',
          correoFactura: generateUniqueEmail('billing'),
          direccion: 'Test Address',
        })
        .expect(201);

      await request(app)
        .post('/api/v1/facturas')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          idInscripcion: 99999, // Non-existent inscription
          idFacturacion: billingDataResponse.body.data.idFacturacion,
          valorPagado: 100.00,
          numeroIngreso: `ING-${Date.now()}`,
          numeroFactura: `FAC-${Date.now()}`,
        })
        .expect(403); // Sistema verifica permisos antes que existencia del recurso
    });

    it('Should fail verifying payment of non-existent invoice', async () => {
      await request(app)
        .patch('/api/v1/facturas/99999/verificar-pago')
        .set(getAuthHeader(contadorTokens.accessToken))
        .expect(404);
    });

    it('Should prevent duplicate voucher uploads for same inscription', async () => {
      // This test would verify that the same voucher can't be used twice
      // Implementation depends on business logic
    });

    it('Should validate CI/Passport uniqueness', async () => {
      const personalData = {
        ciPasaporte: generateUniqueCI(),
        nombres: 'First',
        apellidos: 'User',
        numTelefono: '0987654321',
        correo: generateUniqueEmail('first'),
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero',
        institucion: 'Universidad Test',
      };

      // Create first user
      await request(app)
        .post('/api/v1/datos-personales')
        .send(personalData)
        .expect(201);

      // Try to create second user with same CI
      await request(app)
        .post('/api/v1/datos-personales')
        .send({
          ...personalData,
          nombres: 'Second',
          correo: generateUniqueEmail('second'),
        })
        .expect(409); // Conflict - CI already exists
    });

    it('Should validate email uniqueness in personal data', async () => {
      const email = generateUniqueEmail('duplicate');
      const personalData = {
        nombres: 'Test',
        apellidos: 'User',
        numTelefono: '0987654321',
        correo: email,
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero',
        institucion: 'Universidad Test',
      };

      // Create first user
      await request(app)
        .post('/api/v1/datos-personales')
        .send({
          ...personalData,
          ciPasaporte: generateUniqueCI(),
        })
        .expect(201);

      // Try to create second user with same email
      await request(app)
        .post('/api/v1/datos-personales')
        .send({
          ...personalData,
          ciPasaporte: generateUniqueCI(),
        })
        .expect(409); // Conflict - email already exists
    });
  });

  describe('Authorization Tests', () => {
    it('Should allow public access to personal data and billing data creation', async () => {
      // These should work without authentication (public registration)
      await request(app)
        .post('/api/v1/datos-personales')
        .send({
          ciPasaporte: generateUniqueCI(),
          nombres: 'Public',
          apellidos: 'User',
          numTelefono: '0987654321',
          correo: generateUniqueEmail('public'),
          pais: 'Ecuador',
          provinciaEstado: 'Pichincha',
          ciudad: 'Quito',
          profesion: 'Ingeniero',
          institucion: 'Universidad Test',
        })
        .expect(201);

      await request(app)
        .post('/api/v1/datos-facturacion')
        .send({
          razonSocial: 'Public Company S.A.',
          identificacionTributaria: generateUniqueRUC(),
          telefono: '023456789',
          correoFactura: generateUniqueEmail('public-billing'),
          direccion: 'Public Address',
        })
        .expect(201);
    });

    it('Should require admin authorization for invoice creation', async () => {
      await request(app)
        .post('/api/v1/facturas')
        .send({
          idInscripcion: 1,
          idFacturacion: 1,
          valorPagado: 100.00,
          numeroIngreso: `ING-${Date.now()}`,
          numeroFactura: `FAC-${Date.now()}`,
        })
        .expect(401);
    });

    it('Should require admin/contador authorization for payment verification', async () => {
      await request(app)
        .patch('/api/v1/facturas/1/verificar-pago')
        .expect(401);
    });

    it('Should require admin authorization for enrollment', async () => {
      await request(app)
        .put('/api/v1/inscripciones/1')
        .send({
          matricula: true,
        })
        .expect(401);
    });
  });
});
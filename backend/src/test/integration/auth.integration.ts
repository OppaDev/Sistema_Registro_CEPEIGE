import request from 'supertest';
import app from '@/app';
import { cleanDatabase, closeDatabase } from '@/test/helpers/database.helper';
import { createTestUser, generateTestTokens } from '@/test/helpers/auth.helper';
import { generateUniqueEmail } from '@/test/factories/data.factory';

describe('Authentication Endpoints Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe('POST /api/v1/auth/login', () => {
    let testEmail: string;

    beforeEach(async () => {
      // Create a test user for login tests with unique email
      testEmail = generateUniqueEmail('test');
      await createTestUser(testEmail, 'password123', 'Test', 'User');
    });

    it('INT-AUTH-001: Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user).toHaveProperty('email', testEmail);
      expect(response.body.data.user).toHaveProperty('nombres', 'Test');
      expect(response.body.data.user).toHaveProperty('apellidos', 'User');
      expect(response.body.message).toBe('Login exitoso');
    });

    it('INT-AUTH-002: Should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain('Email o contraseña incorrectos');
      expect(response.body.data).toBeUndefined();
    });

    it('INT-AUTH-003: Should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain('Email o contraseña incorrectos');
      expect(response.body.data).toBeUndefined();
    });

    it('Should validate required fields', async () => {
      // Test missing email
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);

      // Test missing password
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      // Test invalid email format
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const testEmail = generateUniqueEmail('refresh-test');
      // Create user first
      await createTestUser(testEmail, 'password123', 'Test', 'User');
      
      // Perform actual login to create a session with refresh token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'password123',
        });
      
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('INT-AUTH-004: Should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(typeof response.body.data.accessToken).toBe('string');
      expect(response.body.message).toBe('Token renovado exitosamente');
    });

    it('INT-AUTH-005: Should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);

      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain('Token de actualización inválido o expirado');
    });

    it('Should validate required refresh token', async () => {
      await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let accessToken: string;
    let testUser: any;

    beforeEach(async () => {
      const testEmail = generateUniqueEmail('profile-test');
      testUser = await createTestUser(testEmail, 'password123', 'Test', 'User', ['Admin']);
      const tokens = generateTestTokens(testUser);
      accessToken = tokens.accessToken;
    });

    it('INT-AUTH-006: Should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testUser.idUsuario); // El perfil devuelve 'id' no 'idUsuario'
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('roles');
      expect(response.body.data).toHaveProperty('permisos');
      expect(Array.isArray(response.body.data.roles)).toBe(true);
      expect(response.body.message).toBe('Perfil obtenido exitosamente');
    });

    it('INT-AUTH-007: Should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain('Token de acceso requerido. Formato: Bearer <token>');
    });

    it('Should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain('Token de acceso inválido');
    });

    it('Should fail with malformed authorization header', async () => {
      await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('Should logout successfully with valid token', async () => {
      const testEmail = generateUniqueEmail('logout');
      const user = await createTestUser(testEmail, 'password123', 'Logout', 'User');
      const tokens = generateTestTokens(user);
      
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`) // Add auth header
        .send({
          refreshToken: tokens.refreshToken // Enviar refresh token requerido
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Sesión cerrada exitosamente'); // Mensaje correcto
    });

    it('Should fail logout without token', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);
    });
  });
});

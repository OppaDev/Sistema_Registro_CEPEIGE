import request from 'supertest';
import app from '@/app';
import { cleanDatabase, closeDatabase } from '@/test/helpers/database.helper';
import { createTestUser, generateTestTokens } from '@/test/helpers/auth.helper';

describe('Authentication Endpoints Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await createTestUser('test@example.com', 'password123', 'Test', 'User');
    });

    it('INT-AUTH-001: Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.usuario).toHaveProperty('email', 'test@example.com');
      expect(response.body.data.usuario).toHaveProperty('nombres', 'Test');
      expect(response.body.data.usuario).toHaveProperty('apellidos', 'User');
      expect(response.body.message).toBe('Login exitoso');
    });

    it('INT-AUTH-002: Should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciales inválidas');
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

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciales inválidas');
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
      const user = await createTestUser('test@example.com', 'password123', 'Test', 'User');
      const tokens = generateTestTokens(user);
      refreshToken = tokens.refreshToken;
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
      expect(response.body.message).toBe('Token refrescado exitosamente');
    });

    it('INT-AUTH-005: Should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
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
      testUser = await createTestUser('test@example.com', 'password123', 'Test', 'User', ['Admin']);
      const tokens = generateTestTokens(testUser);
      accessToken = tokens.accessToken;
    });

    it('INT-AUTH-006: Should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('idUsuario', testUser.idUsuario);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('nombres', testUser.nombres);
      expect(response.body.data).toHaveProperty('apellidos', testUser.apellidos);
      expect(response.body.data).toHaveProperty('roles');
      expect(Array.isArray(response.body.data.roles)).toBe(true);
      expect(response.body.message).toBe('Perfil obtenido exitosamente');
    });

    it('INT-AUTH-007: Should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token no proporcionado');
    });

    it('Should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
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
    let accessToken: string;

    beforeEach(async () => {
      const user = await createTestUser('test@example.com', 'password123', 'Test', 'User');
      const tokens = generateTestTokens(user);
      accessToken = tokens.accessToken;
    });

    it('Should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout exitoso');
    });

    it('Should fail logout without token', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);
    });
  });
});
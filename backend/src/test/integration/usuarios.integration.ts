import request from 'supertest';
import app from '@/app';
import { cleanDatabase, closeDatabase } from '@/test/helpers/database.helper';
import { createSuperAdmin, createAdmin, createRegularUser, getAuthHeader } from '@/test/helpers/auth.helper';
import { generateUniqueEmail } from '@/test/factories/data.factory';

describe('User Management Endpoints Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe('POST /api/v1/usuarios', () => {
    it('INT-USR-001: Super-Admin should create a new user', async () => {
      const { tokens: superAdminTokens } = await createSuperAdmin();
      const uniqueEmail = generateUniqueEmail('newuser');

      const response = await request(app)
        .post('/api/v1/usuarios')
        .set(getAuthHeader(superAdminTokens.accessToken))
        .send({
          email: uniqueEmail,
          password: 'password123',
          nombres: 'Nuevo',
          apellidos: 'Usuario',
          roles: ['Admin'],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('idUsuario');
      expect(response.body.data).toHaveProperty('email', uniqueEmail);
      expect(response.body.data).toHaveProperty('nombres', 'Nuevo');
      expect(response.body.data).toHaveProperty('apellidos', 'Usuario');
      expect(response.body.data).toHaveProperty('activo', true);
      expect(response.body.data).toHaveProperty('roles');
      expect(Array.isArray(response.body.data.roles)).toBe(true);
      expect(response.body.message).toBe('Usuario creado exitosamente');
    });

    it('INT-USR-002: Admin should not be able to create a user', async () => {
      const { tokens: adminTokens } = await createAdmin();
      const uniqueEmail = generateUniqueEmail('newuser');

      const response = await request(app)
        .post('/api/v1/usuarios')
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          email: uniqueEmail,
          password: 'password123',
          nombres: 'Nuevo',
          apellidos: 'Usuario',
          roles: ['Admin'],
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Sin permisos');
    });

    it('INT-USR-003: Should fail when creating user with existing email', async () => {
      const { tokens: superAdminTokens } = await createSuperAdmin();
      const { user: existingUser } = await createRegularUser();

      const response = await request(app)
        .post('/api/v1/usuarios')
        .set(getAuthHeader(superAdminTokens.accessToken))
        .send({
          email: existingUser.email, // Using existing email
          password: 'password123',
          nombres: 'Duplicate',
          apellidos: 'User',
          roles: ['Admin'],
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('El email ya está en uso');
    });

    it('Should validate required fields', async () => {
      const { tokens: superAdminTokens } = await createSuperAdmin();

      // Missing email
      await request(app)
        .post('/api/v1/usuarios')
        .set(getAuthHeader(superAdminTokens.accessToken))
        .send({
          password: 'password123',
          nombres: 'Test',
          apellidos: 'User',
        })
        .expect(400);

      // Missing password
      await request(app)
        .post('/api/v1/usuarios')
        .set(getAuthHeader(superAdminTokens.accessToken))
        .send({
          email: generateUniqueEmail(),
          nombres: 'Test',
          apellidos: 'User',
        })
        .expect(400);

      // Invalid email format
      await request(app)
        .post('/api/v1/usuarios')
        .set(getAuthHeader(superAdminTokens.accessToken))
        .send({
          email: 'invalid-email',
          password: 'password123',
          nombres: 'Test',
          apellidos: 'User',
        })
        .expect(400);
    });

    it('Should fail without authentication', async () => {
      await request(app)
        .post('/api/v1/usuarios')
        .send({
          email: generateUniqueEmail(),
          password: 'password123',
          nombres: 'Test',
          apellidos: 'User',
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/usuarios', () => {
    it('INT-USR-004: Admin should get list of users', async () => {
      const { tokens: adminTokens } = await createAdmin();
      await createRegularUser(); // Create additional user

      const response = await request(app)
        .get('/api/v1/usuarios')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.message).toBe('Usuarios obtenidos exitosamente');
      
      // Check user structure
      const user = response.body.data[0];
      expect(user).toHaveProperty('idUsuario');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('nombres');
      expect(user).toHaveProperty('apellidos');
      expect(user).toHaveProperty('activo');
      expect(user).toHaveProperty('roles');
      expect(user).not.toHaveProperty('password'); // Password should not be included
    });

    it('Should support pagination', async () => {
      const { tokens: adminTokens } = await createAdmin();
      
      // Create multiple users
      for (let i = 0; i < 15; i++) {
        await createRegularUser(); // This will create users with unique emails
      }

      // Test pagination
      const response = await request(app)
        .get('/api/v1/usuarios?page=1&limit=10')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBeGreaterThan(10);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('Should fail without authentication', async () => {
      await request(app)
        .get('/api/v1/usuarios')
        .expect(401);
    });

    it('Should fail with insufficient permissions', async () => {
      const { tokens: userTokens } = await createRegularUser();

      await request(app)
        .get('/api/v1/usuarios')
        .set(getAuthHeader(userTokens.accessToken))
        .expect(403);
    });
  });

  describe('GET /api/v1/usuarios/:id', () => {
    it('INT-USR-005: Admin should get user by ID', async () => {
      const { tokens: adminTokens } = await createAdmin();
      const { user: targetUser } = await createRegularUser();

      const response = await request(app)
        .get(`/api/v1/usuarios/${targetUser.idUsuario}`)
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('idUsuario', targetUser.idUsuario);
      expect(response.body.data).toHaveProperty('email', targetUser.email);
      expect(response.body.data).toHaveProperty('nombres', targetUser.nombres);
      expect(response.body.data).toHaveProperty('apellidos', targetUser.apellidos);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.message).toBe('Usuario obtenido exitosamente');
    });

    it('Should fail when user not found', async () => {
      const { tokens: adminTokens } = await createAdmin();

      const response = await request(app)
        .get('/api/v1/usuarios/99999')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Usuario no encontrado');
    });

    it('Should fail with invalid user ID', async () => {
      const { tokens: adminTokens } = await createAdmin();

      await request(app)
        .get('/api/v1/usuarios/invalid-id')
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(400);
    });
  });

  describe('PUT /api/v1/usuarios/:id', () => {
    it('INT-USR-006: Super-Admin should update a user', async () => {
      const { tokens: superAdminTokens } = await createSuperAdmin();
      const { user: targetUser } = await createRegularUser();

      const response = await request(app)
        .put(`/api/v1/usuarios/${targetUser.idUsuario}`)
        .set(getAuthHeader(superAdminTokens.accessToken))
        .send({
          nombres: 'Updated',
          apellidos: 'Name',
          roles: ['Admin'],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('nombres', 'Updated');
      expect(response.body.data).toHaveProperty('apellidos', 'Name');
      expect(response.body.message).toBe('Usuario actualizado exitosamente');
    });

    it('Should fail with insufficient permissions', async () => {
      const { tokens: adminTokens } = await createAdmin();
      const { user: targetUser } = await createRegularUser();

      await request(app)
        .put(`/api/v1/usuarios/${targetUser.idUsuario}`)
        .set(getAuthHeader(adminTokens.accessToken))
        .send({
          nombres: 'Updated',
          apellidos: 'Name',
        })
        .expect(403);
    });

    it('Should fail when user not found', async () => {
      const { tokens: superAdminTokens } = await createSuperAdmin();

      const response = await request(app)
        .put('/api/v1/usuarios/99999')
        .set(getAuthHeader(superAdminTokens.accessToken))
        .send({
          nombres: 'Updated',
          apellidos: 'Name',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Usuario no encontrado');
    });
  });

  describe('DELETE /api/v1/usuarios/:id', () => {
    it('INT-USR-007: Super-Admin should delete a user (soft delete)', async () => {
      const { tokens: superAdminTokens } = await createSuperAdmin();
      const { user: targetUser } = await createRegularUser();

      const response = await request(app)
        .delete(`/api/v1/usuarios/${targetUser.idUsuario}`)
        .set(getAuthHeader(superAdminTokens.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('activo', false);
      expect(response.body.message).toBe('Usuario eliminado exitosamente');
    });

    it('Should fail with insufficient permissions', async () => {
      const { tokens: adminTokens } = await createAdmin();
      const { user: targetUser } = await createRegularUser();

      await request(app)
        .delete(`/api/v1/usuarios/${targetUser.idUsuario}`)
        .set(getAuthHeader(adminTokens.accessToken))
        .expect(403);
    });

    it('Should fail when user not found', async () => {
      const { tokens: superAdminTokens } = await createSuperAdmin();

      const response = await request(app)
        .delete('/api/v1/usuarios/99999')
        .set(getAuthHeader(superAdminTokens.accessToken))
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Usuario no encontrado');
    });

    it('Should fail without authentication', async () => {
      await request(app)
        .delete('/api/v1/usuarios/1')
        .expect(401);
    });
  });
});
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TestUser {
  idUsuario: number;
  email: string;
  nombres: string;
  apellidos: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Create a test user with specific roles
 */
export async function createTestUser(
  email: string,
  password: string,
  nombres: string,
  apellidos: string,
  roleNames: string[] = ['USER']
): Promise<TestUser> {
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.usuario.create({
    data: {
      email,
      password: hashedPassword,
      nombres,
      apellidos,
      activo: true,
    },
  });

  // Create roles and assign them
  const userRoles: string[] = [];
  for (const roleName of roleNames) {
    // Find or create role
    let role = await prisma.rol.findUnique({
      where: { nombreRol: roleName },
    });

    if (!role) {
      role = await prisma.rol.create({
        data: {
          nombreRol: roleName,
          descripcionRol: `${roleName} role for testing`,
          activo: true,
        },
      });
    }

    // Assign role to user
    await prisma.usuarioRol.create({
      data: {
        idUsuario: user.idUsuario,
        idRol: role.idRol,
        activo: true,
      },
    });

    userRoles.push(roleName);
  }

  return {
    idUsuario: user.idUsuario,
    email: user.email,
    nombres: user.nombres,
    apellidos: user.apellidos,
    roles: userRoles,
  };
}

/**
 * Generate JWT tokens for a test user
 */
export function generateTestTokens(user: TestUser): AuthTokens {
  // Usar el formato que espera el middleware existente: { sub: idUsuario }
  const payload = {
    sub: user.idUsuario, // El middleware existente espera 'sub'
    idUsuario: user.idUsuario, // Mantener por compatibilidad
    email: user.email,
    roles: user.roles,
  };

  const secret = process.env.JWT_SECRET || 'test-secret';
  const expiresIn = process.env['JWT_EXPIRES_IN'] || '24h';
  const refreshExpiresIn = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';

  const accessToken = jwt.sign(payload, secret as string, { expiresIn } as jwt.SignOptions);
  const refreshToken = jwt.sign({ sub: user.idUsuario, idUsuario: user.idUsuario }, secret as string, { expiresIn: refreshExpiresIn } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

/**
 * Create a Super-Admin test user
 */
export async function createSuperAdmin(): Promise<{ user: TestUser; tokens: AuthTokens }> {
  const user = await createTestUser(
    'superadmin@test.com',
    'password123',
    'Super',
    'Admin',
    ['super-admin'] // Usar el nombre exacto del ROLES constant
  );
  const tokens = generateTestTokens(user);
  return { user, tokens };
}

/**
 * Create an Admin test user
 */
export async function createAdmin(): Promise<{ user: TestUser; tokens: AuthTokens }> {
  const user = await createTestUser(
    'admin@test.com',
    'password123',
    'Test',
    'Admin',
    ['admin'] // Usar el nombre exacto del ROLES constant
  );
  const tokens = generateTestTokens(user);
  return { user, tokens };
}

/**
 * Create a Contador test user
 */
export async function createContador(): Promise<{ user: TestUser; tokens: AuthTokens }> {
  const user = await createTestUser(
    'contador@test.com',
    'password123',
    'Test',
    'Contador',
    ['contador'] // Usar el nombre exacto del ROLES constant
  );
  const tokens = generateTestTokens(user);
  return { user, tokens };
}

/**
 * Create a regular User
 */
export async function createRegularUser(): Promise<{ user: TestUser; tokens: AuthTokens }> {
  const user = await createTestUser(
    'user@test.com',
    'password123',
    'Test',
    'User',
    ['User']
  );
  const tokens = generateTestTokens(user);
  return { user, tokens };
}

/**
 * Get authorization header for tests
 */
export function getAuthHeader(accessToken: string): { Authorization: string } {
  return { Authorization: `Bearer ${accessToken}` };
}
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { jwtConfig } from '@/config/jwt';

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
      // Try to create the role, but handle case where it might have been created concurrently
      try {
        role = await prisma.rol.create({
          data: {
            nombreRol: roleName,
            descripcionRol: `${roleName} role for testing`,
            activo: true,
          },
        });
      } catch (error: any) {
        // If role was created concurrently, fetch it
        if (error.code === 'P2002') {
          role = await prisma.rol.findUnique({
            where: { nombreRol: roleName },
          });
          if (!role) {
            throw new Error(`Failed to create or find role: ${roleName}`);
          }
        } else {
          throw error;
        }
      }
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
    email: user.email,
    roles: user.roles,
  };

  // Usar las mismas configuraciones de JWT que el sistema
  const accessToken = jwt.sign(payload, jwtConfig.access.secret as string, { 
    expiresIn: jwtConfig.access.expiresIn 
  } as jwt.SignOptions);
  
  const refreshToken = jwt.sign({ sub: user.idUsuario }, jwtConfig.refresh.secret as string, { 
    expiresIn: jwtConfig.refresh.expiresIn 
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

/**
 * Create a Super-Admin test user
 */
export async function createSuperAdmin(): Promise<{ user: TestUser; tokens: AuthTokens }> {
  const timestamp = Date.now();
  const user = await createTestUser(
    `superadmin-${timestamp}@test.com`,
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
  const timestamp = Date.now();
  const user = await createTestUser(
    `admin-${timestamp}@test.com`,
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
  const timestamp = Date.now();
  const user = await createTestUser(
    `contador-${timestamp}@test.com`,
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
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const user = await createTestUser(
    `user-${timestamp}-${random}@test.com`,
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
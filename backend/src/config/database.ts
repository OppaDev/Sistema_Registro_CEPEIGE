import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env['NODE_ENV'] === 'development' ? 
    ['query', 'info', 'warn', 'error'] : 
    ['error'],
  errorFormat: 'pretty',
});

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Prisma conectado a PostgreSQL');
    
    // Test de conexión
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Test de conexión a BD exitoso');
    
  } catch (error) {
    logger.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Prisma desconectado');
  } catch (error) {
    logger.error('Error desconectando de la base de datos:', error);
    throw error;
  }
}

// Manejo de cierre graceful
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clean all test data from database
 * Order matters due to foreign key constraints
 */
export async function cleanDatabase(): Promise<void> {
  await prisma.$transaction([
    // Delete in order to respect foreign key constraints
    prisma.sesionUsuario.deleteMany(),
    prisma.inscripcionMoodle.deleteMany(),
    prisma.grupoTelegram.deleteMany(),
    prisma.cursoMoodle.deleteMany(),
    prisma.factura.deleteMany(),
    prisma.rolPermiso.deleteMany(),
    prisma.usuarioRol.deleteMany(),
    prisma.inscripcion.deleteMany(),
    prisma.comprobante.deleteMany(),
    prisma.curso.deleteMany(),
    prisma.datosPersonales.deleteMany(),
    prisma.datosFacturacion.deleteMany(),
    prisma.descuento.deleteMany(),
    prisma.usuario.deleteMany(),
    prisma.rol.deleteMany(),
    prisma.permiso.deleteMany(),
  ]);
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Get a fresh Prisma instance for tests
 */
export function getTestPrismaClient(): PrismaClient {
  return prisma;
}

/**
 * Execute raw SQL for complex cleanup or setup
 */
export async function executeRawSQL(sql: string): Promise<void> {
  await prisma.$executeRawUnsafe(sql);
}

/**
 * Reset auto-increment sequences (useful for consistent test data)
 */
export async function resetSequences(): Promise<void> {
  const tables = [
    'usuario', 'rol', 'permiso', 'curso', 'datos_personales',
    'datos_facturacion', 'descuento', 'inscripcion', 'comprobante', 'factura'
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('${table}', '${table === 'datos_personales' ? 'id_persona' : 
        table === 'datos_facturacion' ? 'id_facturacion' : 
        table === 'curso' ? 'id_curso' :
        table === 'inscripcion' ? 'id_inscripcion' :
        table === 'comprobante' ? 'id_comprobante' :
        table === 'factura' ? 'id_factura' :
        table === 'descuento' ? 'id_descuento' :
        table === 'usuario' ? 'id_usuario' :
        table === 'rol' ? 'id_rol' :
        'id_permiso'}'), 1, false);
    `);
  }
}
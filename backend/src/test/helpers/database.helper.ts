import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clean all test data from database
 * Order matters due to foreign key constraints
 */
export async function cleanDatabase(): Promise<void> {
  // Use explicit transaction with proper order and serialization to prevent deadlocks
  await prisma.$transaction(async (tx) => {
    // Delete all session data first
    await tx.sesionUsuario.deleteMany();
    
    // Delete Moodle and Telegram integrations
    await tx.inscripcionMoodle.deleteMany();
    await tx.grupoTelegram.deleteMany();
    await tx.cursoMoodle.deleteMany();
    
    // Delete financial records (facturas must be deleted before inscripcion)
    await tx.factura.deleteMany();
    
    // Delete user-role relationships
    await tx.usuarioRol.deleteMany();
    await tx.rolPermiso.deleteMany();
    
    // Delete inscriptions (must be deleted before comprobante and other dependent tables)
    await tx.inscripcion.deleteMany();
    
    // Delete supporting data
    await tx.comprobante.deleteMany();
    await tx.descuento.deleteMany();
    await tx.datosPersonales.deleteMany();
    await tx.datosFacturacion.deleteMany();
    
    // Delete courses
    await tx.curso.deleteMany();
    
    // Delete users and roles
    await tx.usuario.deleteMany();
    await tx.rol.deleteMany();
    await tx.permiso.deleteMany();
  }, {
    isolationLevel: 'Serializable', // Prevent concurrent transactions
    timeout: 30000 // 30 second timeout
  });
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
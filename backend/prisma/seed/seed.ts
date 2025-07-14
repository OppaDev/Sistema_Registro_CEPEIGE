import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear Roles
  console.log('📝 Creando roles...');
  const superAdminRole = await prisma.rol.upsert({
    where: { nombreRol: 'Super-Admin' },
    update: {},
    create: { 
      nombreRol: 'Super-Admin', 
      descripcionRol: 'Acceso total al sistema - Puede gestionar usuarios, roles y toda la configuración' 
    },
  });

  const adminRole = await prisma.rol.upsert({
    where: { nombreRol: 'Admin' },
    update: {},
    create: { 
      nombreRol: 'Admin', 
      descripcionRol: 'Administrador del sistema - Puede gestionar cursos, inscripciones, datos personales y facturación' 
    },
  });

  const contadorRole = await prisma.rol.upsert({
    where: { nombreRol: 'Contador' },
    update: {},
    create: { 
      nombreRol: 'Contador', 
      descripcionRol: 'Contador - Acceso a datos de facturación y verificación de pagos' 
    },
  });

  console.log(`✅ Roles creados: Super-Admin (${superAdminRole.idRol}), Admin (${adminRole.idRol}), Contador (${contadorRole.idRol})`);

  // 2. Crear Permisos
  console.log('🔐 Creando permisos...');
  const permisos = [
    // Usuarios
    { nombrePermiso: 'crear:usuario', descripcionPermiso: 'Crear nuevos usuarios', recurso: 'usuarios', accion: 'crear' },
    { nombrePermiso: 'leer:usuarios', descripcionPermiso: 'Ver todos los usuarios', recurso: 'usuarios', accion: 'leer' },
    { nombrePermiso: 'actualizar:usuario', descripcionPermiso: 'Actualizar información de usuarios', recurso: 'usuarios', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:usuario', descripcionPermiso: 'Eliminar usuarios', recurso: 'usuarios', accion: 'eliminar' },
    
    // Roles y Permisos
    { nombrePermiso: 'gestionar:roles', descripcionPermiso: 'Gestionar roles y permisos', recurso: 'roles', accion: 'gestionar' },
    
    // Cursos
    { nombrePermiso: 'crear:curso', descripcionPermiso: 'Crear nuevos cursos', recurso: 'cursos', accion: 'crear' },
    { nombrePermiso: 'leer:cursos', descripcionPermiso: 'Ver todos los cursos', recurso: 'cursos', accion: 'leer' },
    { nombrePermiso: 'actualizar:curso', descripcionPermiso: 'Actualizar información de cursos', recurso: 'cursos', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:curso', descripcionPermiso: 'Eliminar cursos', recurso: 'cursos', accion: 'eliminar' },
    
    // Inscripciones
    { nombrePermiso: 'crear:inscripcion', descripcionPermiso: 'Crear nuevas inscripciones', recurso: 'inscripciones', accion: 'crear' },
    { nombrePermiso: 'leer:inscripciones', descripcionPermiso: 'Ver todas las inscripciones', recurso: 'inscripciones', accion: 'leer' },
    { nombrePermiso: 'actualizar:inscripcion', descripcionPermiso: 'Actualizar inscripciones', recurso: 'inscripciones', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:inscripcion', descripcionPermiso: 'Eliminar inscripciones', recurso: 'inscripciones', accion: 'eliminar' },
    { nombrePermiso: 'actualizar:matricula', descripcionPermiso: 'Cambiar estado de matrícula', recurso: 'inscripciones', accion: 'matricula' },
    
    // Datos Personales
    { nombrePermiso: 'crear:datos-personales', descripcionPermiso: 'Crear datos personales', recurso: 'datos-personales', accion: 'crear' },
    { nombrePermiso: 'leer:datos-personales', descripcionPermiso: 'Ver datos personales', recurso: 'datos-personales', accion: 'leer' },
    { nombrePermiso: 'actualizar:datos-personales', descripcionPermiso: 'Actualizar datos personales', recurso: 'datos-personales', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:datos-personales', descripcionPermiso: 'Eliminar datos personales', recurso: 'datos-personales', accion: 'eliminar' },
    
    // Facturación
    { nombrePermiso: 'crear:facturacion', descripcionPermiso: 'Crear datos de facturación', recurso: 'facturacion', accion: 'crear' },
    { nombrePermiso: 'leer:facturacion', descripcionPermiso: 'Ver datos de facturación', recurso: 'facturacion', accion: 'leer' },
    { nombrePermiso: 'actualizar:facturacion', descripcionPermiso: 'Actualizar datos de facturación', recurso: 'facturacion', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:facturacion', descripcionPermiso: 'Eliminar datos de facturación', recurso: 'facturacion', accion: 'eliminar' },
    { nombrePermiso: 'verificar:pago', descripcionPermiso: 'Verificar pagos y facturas', recurso: 'facturacion', accion: 'verificar' },
    
    // Comprobantes
    { nombrePermiso: 'crear:comprobante', descripcionPermiso: 'Subir comprobantes de pago', recurso: 'comprobantes', accion: 'crear' },
    { nombrePermiso: 'leer:comprobantes', descripcionPermiso: 'Ver comprobantes de pago', recurso: 'comprobantes', accion: 'leer' },
    { nombrePermiso: 'eliminar:comprobante', descripcionPermiso: 'Eliminar comprobantes de pago', recurso: 'comprobantes', accion: 'eliminar' },
    
    // Descuentos
    { nombrePermiso: 'crear:descuento', descripcionPermiso: 'Crear descuentos', recurso: 'descuentos', accion: 'crear' },
    { nombrePermiso: 'leer:descuentos', descripcionPermiso: 'Ver descuentos', recurso: 'descuentos', accion: 'leer' },
    { nombrePermiso: 'actualizar:descuento', descripcionPermiso: 'Actualizar descuentos', recurso: 'descuentos', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:descuento', descripcionPermiso: 'Eliminar descuentos', recurso: 'descuentos', accion: 'eliminar' },
  ];

  const permisosCreados: any[] = [];
  for (const permisoData of permisos) {
    const permiso = await prisma.permiso.upsert({
      where: { nombrePermiso: permisoData.nombrePermiso },
      update: {},
      create: permisoData,
    });
    permisosCreados.push(permiso);
  }

  console.log(`✅ ${permisosCreados.length} permisos creados/verificados`);

  // 3. Asignar Permisos a Roles
  console.log('🔗 Asignando permisos a roles...');

  // Super-Admin tiene TODOS los permisos
  const todosLosPermisos = await prisma.permiso.findMany();
  for (const permiso of todosLosPermisos) {
    await prisma.rolPermiso.upsert({
      where: { 
        idRol_idPermiso: { 
          idRol: superAdminRole.idRol, 
          idPermiso: permiso.idPermiso 
        } 
      },
      update: {},
      create: { 
        idRol: superAdminRole.idRol, 
        idPermiso: permiso.idPermiso 
      },
    });
  }

  // Admin - Permisos de gestión operativa (sin gestión de usuarios/roles)
  const permisosAdmin = [
    'leer:usuarios', // Solo leer usuarios, no crear/eliminar
    'crear:curso', 'leer:cursos', 'actualizar:curso', 'eliminar:curso',
    'crear:inscripcion', 'leer:inscripciones', 'actualizar:inscripcion', 'eliminar:inscripcion', 'actualizar:matricula',
    'crear:datos-personales', 'leer:datos-personales', 'actualizar:datos-personales', 'eliminar:datos-personales',
    'crear:facturacion', 'leer:facturacion', 'actualizar:facturacion', 'eliminar:facturacion',
    'crear:comprobante', 'leer:comprobantes', 'eliminar:comprobante',
    'crear:descuento', 'leer:descuentos', 'actualizar:descuento', 'eliminar:descuento'
  ];

  for (const nombrePermiso of permisosAdmin) {
    const permiso = await prisma.permiso.findUnique({ where: { nombrePermiso } });
    if (permiso) {
      await prisma.rolPermiso.upsert({
        where: { 
          idRol_idPermiso: { 
            idRol: adminRole.idRol, 
            idPermiso: permiso.idPermiso 
          } 
        },
        update: {},
        create: { 
          idRol: adminRole.idRol, 
          idPermiso: permiso.idPermiso 
        },
      });
    }
  }

  // Contador - Solo permisos relacionados con facturación y reportes financieros
  const permisosContador = [
    'leer:inscripciones', // Solo lectura para ver inscripciones
    'leer:datos-personales', // Solo lectura de datos personales
    'crear:facturacion', 'leer:facturacion', 'actualizar:facturacion', 'verificar:pago',
    'leer:comprobantes', // Ver comprobantes pero no subirlos
    'leer:reportes'
  ];

  for (const nombrePermiso of permisosContador) {
    const permiso = await prisma.permiso.findUnique({ where: { nombrePermiso } });
    if (permiso) {
      await prisma.rolPermiso.upsert({
        where: { 
          idRol_idPermiso: { 
            idRol: contadorRole.idRol, 
            idPermiso: permiso.idPermiso 
          } 
        },
        update: {},
        create: { 
          idRol: contadorRole.idRol, 
          idPermiso: permiso.idPermiso 
        },
      });
    }
  }

  console.log('✅ Permisos asignados a todos los roles');

  // 4. Crear usuario Super-Admin inicial
  console.log('👤 Creando usuario Super-Admin inicial...');
  const hashedPassword = await bcrypt.hash(process.env['SUPERADMIN_PASSWORD'] || 'SuperAdmin123!', 10);
  
  const superAdminUser = await prisma.usuario.upsert({
    where: { email: 'superadmin@cepeige.com' },
    update: {},
    create: {
      email: 'superadmin@cepeige.com',
      password: hashedPassword,
      nombres: 'Super',
      apellidos: 'Admin',
      activo: true,
    },
  });

  // Asignar el rol de Super-Admin al usuario
  await prisma.usuarioRol.upsert({
    where: { 
      idUsuario_idRol: { 
        idUsuario: superAdminUser.idUsuario, 
        idRol: superAdminRole.idRol 
      } 
    },
    update: {},
    create: { 
      idUsuario: superAdminUser.idUsuario, 
      idRol: superAdminRole.idRol 
    },
  });

  console.log(`✅ Usuario Super-Admin creado: ${superAdminUser.email} (ID: ${superAdminUser.idUsuario})`);

  // 5. Crear usuarios de ejemplo para Admin y Contador
  console.log('👥 Creando usuarios de ejemplo...');
  
  // Usuario Admin
  const adminPassword = await bcrypt.hash(process.env['ADMIN_PASSWORD'] || 'Admin123!', 10);
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@cepeige.com' },
    update: {},
    create: {
      email: 'admin@cepeige.com',
      password: adminPassword,
      nombres: 'Admin',
      apellidos: 'CEPEIGE',
      activo: true,
    },
  });

  await prisma.usuarioRol.upsert({
    where: { 
      idUsuario_idRol: { 
        idUsuario: adminUser.idUsuario, 
        idRol: adminRole.idRol 
      } 
    },
    update: {},
    create: { 
      idUsuario: adminUser.idUsuario, 
      idRol: adminRole.idRol 
    },
  });

  // Usuario Contador
  const contadorPassword = await bcrypt.hash(process.env['CONTADOR_PASSWORD'] || 'Contador123!', 10);
  const contadorUser = await prisma.usuario.upsert({
    where: { email: 'contador@cepeige.com' },
    update: {},
    create: {
      email: 'contador@cepeige.com',
      password: contadorPassword,
      nombres: 'Contador',
      apellidos: 'CEPEIGE',
      activo: true,
    },
  });

  await prisma.usuarioRol.upsert({
    where: { 
      idUsuario_idRol: { 
        idUsuario: contadorUser.idUsuario, 
        idRol: contadorRole.idRol 
      } 
    },
    update: {},
    create: { 
      idUsuario: contadorUser.idUsuario, 
      idRol: contadorRole.idRol 
    },
  });

  console.log(`✅ Usuarios creados: Admin (${adminUser.email}), Contador (${contadorUser.email})`);

  console.log('🎉 Seed completado exitosamente!');
  console.log('📧 Credenciales creadas:');
  console.log('   Super-Admin: superadmin@cepeige.com / SuperAdmin123!');
  console.log('   Admin: admin@cepeige.com / Admin123!');
  console.log('   Contador: contador@cepeige.com / Contador123!');
  console.log('⚠️  IMPORTANTE: Cambia estas contraseñas en producción!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

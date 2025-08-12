import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear Roles
  console.log('📝 Creando roles...');
  const superAdminRole = await prisma.rol.upsert({
    where: { nombreRol: 'super-admin' },
    update: {},
    create: { 
      nombreRol: 'super-admin', 
      descripcionRol: 'Acceso total al sistema - Puede gestionar usuarios, roles y toda la configuración' 
    },
  });

  const adminRole = await prisma.rol.upsert({
    where: { nombreRol: 'admin' },
    update: {},
    create: { 
      nombreRol: 'admin', 
      descripcionRol: 'Administrador del sistema - Puede gestionar cursos, inscripciones, datos personales y facturación' 
    },
  });

  const contadorRole = await prisma.rol.upsert({
    where: { nombreRol: 'contador' },
    update: {},
    create: { 
      nombreRol: 'contador', 
      descripcionRol: 'Contador - Acceso a datos de facturación y verificación de pagos' 
    },
  });

  console.log(`✅ Roles creados: Super-Admin (${superAdminRole.idRol}), Admin (${adminRole.idRol}), Contador (${contadorRole.idRol})`);

  // 2. Crear Permisos basados en el árbol de permisos CEPEIGE
  console.log('🔐 Creando permisos...');
  const permisos = [
    // GESTIÓN DE USUARIOS - Solo Super-Admin
    { nombrePermiso: 'crear:usuario', descripcionPermiso: 'Crear nuevos usuarios', recurso: 'usuarios', accion: 'crear' },
    { nombrePermiso: 'leer:usuarios', descripcionPermiso: 'Ver todos los usuarios', recurso: 'usuarios', accion: 'leer' },
    { nombrePermiso: 'actualizar:usuario', descripcionPermiso: 'Actualizar información de usuarios', recurso: 'usuarios', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:usuario', descripcionPermiso: 'Eliminar usuarios', recurso: 'usuarios', accion: 'eliminar' },
    
    // GESTIÓN DE CURSOS
    { nombrePermiso: 'crear:curso', descripcionPermiso: 'Crear nuevos cursos', recurso: 'cursos', accion: 'crear' },
    { nombrePermiso: 'leer:cursos', descripcionPermiso: 'Ver todos los cursos', recurso: 'cursos', accion: 'leer' },
    { nombrePermiso: 'leer:cursos-disponibles', descripcionPermiso: 'Ver cursos disponibles', recurso: 'cursos', accion: 'leer-disponibles' },
    { nombrePermiso: 'actualizar:curso', descripcionPermiso: 'Actualizar información de cursos', recurso: 'cursos', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:curso', descripcionPermiso: 'Eliminar cursos', recurso: 'cursos', accion: 'eliminar' },
    
    // DATOS PERSONALES
    { nombrePermiso: 'crear:datos-personales', descripcionPermiso: 'Crear datos personales', recurso: 'datos-personales', accion: 'crear' },
    { nombrePermiso: 'leer:datos-personales', descripcionPermiso: 'Ver datos personales', recurso: 'datos-personales', accion: 'leer' },
    { nombrePermiso: 'buscar:datos-personales', descripcionPermiso: 'Buscar datos personales por CI/Pasaporte', recurso: 'datos-personales', accion: 'buscar' },
    { nombrePermiso: 'actualizar:datos-personales', descripcionPermiso: 'Actualizar datos personales', recurso: 'datos-personales', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:datos-personales', descripcionPermiso: 'Eliminar datos personales', recurso: 'datos-personales', accion: 'eliminar' },
    
    // DATOS DE FACTURACIÓN
    { nombrePermiso: 'crear:datos-facturacion', descripcionPermiso: 'Crear datos de facturación', recurso: 'datos-facturacion', accion: 'crear' },
    { nombrePermiso: 'leer:datos-facturacion', descripcionPermiso: 'Ver datos de facturación', recurso: 'datos-facturacion', accion: 'leer' },
    { nombrePermiso: 'actualizar:datos-facturacion', descripcionPermiso: 'Actualizar datos de facturación', recurso: 'datos-facturacion', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:datos-facturacion', descripcionPermiso: 'Eliminar datos de facturación', recurso: 'datos-facturacion', accion: 'eliminar' },
    
    // COMPROBANTES
    { nombrePermiso: 'crear:comprobante', descripcionPermiso: 'Subir comprobantes de pago', recurso: 'comprobantes', accion: 'crear' },
    { nombrePermiso: 'leer:comprobantes', descripcionPermiso: 'Ver comprobantes de pago', recurso: 'comprobantes', accion: 'leer' },
    { nombrePermiso: 'eliminar:comprobante', descripcionPermiso: 'Eliminar comprobantes de pago', recurso: 'comprobantes', accion: 'eliminar' },
    
    // INSCRIPCIONES
    { nombrePermiso: 'crear:inscripcion', descripcionPermiso: 'Crear nuevas inscripciones', recurso: 'inscripciones', accion: 'crear' },
    { nombrePermiso: 'leer:inscripciones', descripcionPermiso: 'Ver todas las inscripciones', recurso: 'inscripciones', accion: 'leer' },
    { nombrePermiso: 'actualizar:inscripcion', descripcionPermiso: 'Actualizar inscripciones (matricular)', recurso: 'inscripciones', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:inscripcion', descripcionPermiso: 'Eliminar inscripciones', recurso: 'inscripciones', accion: 'eliminar' },
    
    // DESCUENTOS
    { nombrePermiso: 'crear:descuento', descripcionPermiso: 'Crear descuentos', recurso: 'descuentos', accion: 'crear' },
    { nombrePermiso: 'leer:descuentos', descripcionPermiso: 'Ver descuentos', recurso: 'descuentos', accion: 'leer' },
    { nombrePermiso: 'actualizar:descuento', descripcionPermiso: 'Actualizar descuentos', recurso: 'descuentos', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:descuento', descripcionPermiso: 'Eliminar descuentos', recurso: 'descuentos', accion: 'eliminar' },
    
    // FACTURAS
    { nombrePermiso: 'crear:factura', descripcionPermiso: 'Crear facturas', recurso: 'facturas', accion: 'crear' },
    { nombrePermiso: 'leer:facturas', descripcionPermiso: 'Ver facturas', recurso: 'facturas', accion: 'leer' },
    { nombrePermiso: 'actualizar:factura', descripcionPermiso: 'Actualizar facturas', recurso: 'facturas', accion: 'actualizar' },
    { nombrePermiso: 'eliminar:factura', descripcionPermiso: 'Eliminar facturas', recurso: 'facturas', accion: 'eliminar' },
    { nombrePermiso: 'buscar:factura-numero', descripcionPermiso: 'Buscar factura por número', recurso: 'facturas', accion: 'buscar-numero' },
    { nombrePermiso: 'buscar:factura-ingreso', descripcionPermiso: 'Buscar factura por número de ingreso', recurso: 'facturas', accion: 'buscar-ingreso' },
    { nombrePermiso: 'buscar:factura-inscripcion', descripcionPermiso: 'Buscar factura por inscripción', recurso: 'facturas', accion: 'buscar-inscripcion' },
    { nombrePermiso: 'verificar:pago', descripcionPermiso: 'Verificar pagos de facturas', recurso: 'facturas', accion: 'verificar-pago' },
    
    // INFORMES
    { nombrePermiso: 'leer:tipos-informe', descripcionPermiso: 'Ver tipos de informe disponibles', recurso: 'informes', accion: 'leer-tipos' },
    { nombrePermiso: 'leer:cursos-informe', descripcionPermiso: 'Ver cursos para filtros de informes', recurso: 'informes', accion: 'leer-cursos' },
    { nombrePermiso: 'leer:estadisticas', descripcionPermiso: 'Ver estadísticas de informes', recurso: 'informes', accion: 'leer-estadisticas' },
    { nombrePermiso: 'leer:datos-informe', descripcionPermiso: 'Ver datos de informes', recurso: 'informes', accion: 'leer-datos' },
    { nombrePermiso: 'generar:informe', descripcionPermiso: 'Generar informes', recurso: 'informes', accion: 'generar' },
    { nombrePermiso: 'generar:excel', descripcionPermiso: 'Generar informes en Excel', recurso: 'informes', accion: 'generar-excel' },
    { nombrePermiso: 'generar:pdf', descripcionPermiso: 'Generar informes en PDF', recurso: 'informes', accion: 'generar-pdf' },
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

  // Admin - Permisos según árbol de permisos CEPEIGE
  const permisosAdmin = [
    // Cursos: crear, listar, ver específico, actualizar (NO eliminar)
    'crear:curso', 'leer:cursos', 'actualizar:curso',
    
    // Datos Personales: crear, consultar, actualizar (NO eliminar)
    'crear:datos-personales', 'leer:datos-personales', 'buscar:datos-personales', 'actualizar:datos-personales',
    
    // Datos de Facturación: crear, consultar, actualizar (NO eliminar)
    'crear:datos-facturacion', 'leer:datos-facturacion', 'actualizar:datos-facturacion',
    
    // Comprobantes: crear, consultar (NO eliminar)
    'crear:comprobante', 'leer:comprobantes',
    
    // Inscripciones: crear, consultar, actualizar (NO eliminar)
    'crear:inscripcion', 'leer:inscripciones', 'actualizar:inscripcion',
    
    // Descuentos: crear, consultar, actualizar (NO eliminar)
    'crear:descuento', 'leer:descuentos', 'actualizar:descuento',
    
    // Facturas: SOLO consultar (todos los GET)
    'leer:facturas', 'buscar:factura-numero', 'buscar:factura-ingreso', 'buscar:factura-inscripcion',
    
    // Informes: control total
    'leer:tipos-informe', 'leer:cursos-informe', 'leer:estadisticas', 'leer:datos-informe', 
    'generar:informe', 'generar:excel', 'generar:pdf'
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

  // Contador - Permisos según árbol de permisos CEPEIGE
  const permisosContador = [
    // Cursos: solo listar (GET /cursos y GET /cursos/:id)
    'leer:cursos',
    
    // Datos Personales: solo consultar (todos los GET)
    'leer:datos-personales', 'buscar:datos-personales',
    
    // Datos de Facturación: consultar y actualizar
    'leer:datos-facturacion', 'actualizar:datos-facturacion',
    
    // Comprobantes: solo consultar
    'leer:comprobantes',
    
    // Inscripciones: solo consultar
    'leer:inscripciones',
    
    // Descuentos: solo consultar
    'leer:descuentos',
    
    // Facturas: todos menos eliminar (crear, consultar, actualizar, verificar pago)
    'crear:factura', 'leer:facturas', 'actualizar:factura',
    'buscar:factura-numero', 'buscar:factura-ingreso', 'buscar:factura-inscripcion', 'verificar:pago',
    
    // Informes: control total
    'leer:tipos-informe', 'leer:cursos-informe', 'leer:estadisticas', 'leer:datos-informe', 
    'generar:informe', 'generar:excel', 'generar:pdf'
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

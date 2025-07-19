// Mappers de inscripciones
export { toComprobanteResponseDto } from '@/api/services/mappers/inscripcionMapper/comprobante.mapper';
export { toCursoResponseDto } from '@/api/services/mappers/cursoMapper/curso.mapper';
export { toDatosFacturacionResponseDto } from '@/api/services/mappers/inscripcionMapper/datosFacturacion.mapper';
export { toDatosPersonalesResponseDto } from '@/api/services/mappers/inscripcionMapper/datosPersonales.mapper';
export { toDescuentoResponseDto } from '@/api/services/mappers/validarPagoMapper/descuento.mapper';
export { toFacturaResponseDto, toFacturaWithRelationsResponseDto, type PrismaFacturaConRelaciones } from '@/api/services/mappers/validarPagoMapper/factura.mapper';
export { toInscripcionResponseDto, toInscripcionAdminResponseDto, type PrismaInscripcionConRelaciones, type PrismaInscripcionAdminConRelaciones } from '@/api/services/mappers/inscripcionMapper/inscripcion.mapper';

// Mappers de autenticación
export { toUsuarioResponseDto, toUsuarioDetailResponseDto, toUsuarioDetailDto, type PrismaUsuarioConRoles } from '@/api/services/mappers/authMapper/usuario.mapper';
export { toRolResponseDto, toRolesResponseDto } from '@/api/services/mappers/authMapper/rol.mapper';

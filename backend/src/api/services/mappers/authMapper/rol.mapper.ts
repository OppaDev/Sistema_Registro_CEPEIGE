import { Rol as PrismaRol } from '@prisma/client';

/**
 * Mapea un rol de Prisma a un objeto simple
 */
export const toRolResponseDto = (rol: PrismaRol) => {
  return {
    idRol: rol.idRol,
    nombreRol: rol.nombreRol,
    descripcionRol: rol.descripcionRol,
    activo: rol.activo,
    fechaCreacion: rol.fechaCreacion
  };
};

/**
 * Mapea múltiples roles de Prisma
 */
export const toRolesResponseDto = (roles: PrismaRol[]) => {
  return roles.map(rol => toRolResponseDto(rol));
};

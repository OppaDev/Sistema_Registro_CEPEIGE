import { Usuario as PrismaUsuario, UsuarioRol as PrismaUsuarioRol, Rol as PrismaRol } from '@prisma/client';
import { UsuarioResponseDto } from '@/api/dtos/authDto/auth.dto';
import { UsuarioDetailResponseDto as UsuarioDetailDto } from '@/api/dtos/authDto/usuario.dto';

// Tipo para usuario con roles incluidos
export type PrismaUsuarioConRoles = PrismaUsuario & {
  roles: (PrismaUsuarioRol & {
    rol: PrismaRol;
  })[];
};

/**
 * Mapea un usuario de Prisma a UsuarioResponseDto (usado en login)
 */
export const toUsuarioResponseDto = (usuario: PrismaUsuarioConRoles): UsuarioResponseDto => {
  return {
    idUsuario: usuario.idUsuario,
    email: usuario.email,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    activo: usuario.activo,
    roles: usuario.roles.map(ur => ur.rol.nombreRol),
    ultimoAcceso: usuario.ultimoAcceso
  };
};

/**
 * Mapea un usuario de Prisma a UsuarioDetailResponseDto (usado en CRUD de usuarios)
 */
export const toUsuarioDetailResponseDto = (usuario: PrismaUsuarioConRoles): UsuarioDetailDto => {
  return {
    idUsuario: usuario.idUsuario,
    email: usuario.email,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    activo: usuario.activo,
    fechaCreacion: usuario.fechaCreacion,
    fechaActualizacion: usuario.fechaActualizacion,
    ultimoAcceso: usuario.ultimoAcceso,
    roles: usuario.roles.map(ur => ({
      idRol: ur.rol.idRol,
      nombreRol: ur.rol.nombreRol,
      descripcionRol: ur.rol.descripcionRol,
      fechaAsignacion: ur.fechaAsignacion,
      activo: ur.activo
    }))
  };
};

/**
 * Mapea un usuario de Prisma a UsuarioDetailDto (usado en usuario.service.ts)
 */
export const toUsuarioDetailDto = (usuario: PrismaUsuarioConRoles): UsuarioDetailDto => {
  return {
    idUsuario: usuario.idUsuario,
    email: usuario.email,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    activo: usuario.activo,
    fechaCreacion: usuario.fechaCreacion,
    fechaActualizacion: usuario.fechaActualizacion,
    ultimoAcceso: usuario.ultimoAcceso,
    roles: usuario.roles.map(ur => ({
      idRol: ur.rol.idRol,
      nombreRol: ur.rol.nombreRol,
      descripcionRol: ur.rol.descripcionRol,
      fechaAsignacion: ur.fechaAsignacion,
      activo: ur.activo
    }))
  };
};

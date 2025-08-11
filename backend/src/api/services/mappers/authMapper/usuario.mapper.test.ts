import { describe, it, expect } from '@jest/globals';
import { toUsuarioResponseDto, toUsuarioDetailResponseDto, toUsuarioDetailDto, type PrismaUsuarioConRoles } from './usuario.mapper';

describe('Usuario Mapper', () => {
  const mockUsuario: PrismaUsuarioConRoles = {
    idUsuario: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    nombres: 'Juan',
    apellidos: 'Pérez',
    activo: true,
    fechaCreacion: new Date('2023-01-01'),
    fechaActualizacion: new Date('2023-01-02'),
    ultimoAcceso: new Date('2023-01-03'),
    roles: [
      {
        idUsuario: 1,
        idRol: 1,
        fechaAsignacion: new Date('2023-01-01'),
        activo: true,
        rol: {
          idRol: 1,
          nombreRol: 'ADMIN',
          descripcionRol: 'Administrador del sistema',
          activo: true,
          fechaCreacion: new Date('2023-01-01')
        }
      },
      {
        idUsuario: 1,
        idRol: 2,
        fechaAsignacion: new Date('2023-01-01'),
        activo: true,
        rol: {
          idRol: 2,
          nombreRol: 'USER',
          descripcionRol: 'Usuario estándar',
          activo: true,
          fechaCreacion: new Date('2023-01-01')
        }
      }
    ]
  };

  describe('toUsuarioResponseDto', () => {
    // MAP-AUT-001: Mapear PrismaUsuarioConRoles a UsuarioResponseDto correctamente
    it('MAP-AUT-001: should map PrismaUsuarioConRoles to UsuarioResponseDto correctly', () => {
      const result = toUsuarioResponseDto(mockUsuario);

      expect(result).toEqual({
        idUsuario: 1,
        email: 'test@example.com',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
        roles: ['ADMIN', 'USER'],
        ultimoAcceso: new Date('2023-01-03')
      });
    });

    it('should handle usuario with no roles', () => {
      const usuarioSinRoles = { ...mockUsuario, roles: [] };
      const result = toUsuarioResponseDto(usuarioSinRoles);

      expect(result.roles).toEqual([]);
    });

    it('should handle usuario with null ultimoAcceso', () => {
      const usuarioSinAcceso = { ...mockUsuario, ultimoAcceso: null };
      const result = toUsuarioResponseDto(usuarioSinAcceso);

      expect(result.ultimoAcceso).toBeNull();
    });
  });

  describe('toUsuarioDetailResponseDto', () => {
    it('should map PrismaUsuarioConRoles to UsuarioDetailResponseDto correctly', () => {
      const result = toUsuarioDetailResponseDto(mockUsuario);

      expect(result).toEqual({
        idUsuario: 1,
        email: 'test@example.com',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
        fechaCreacion: new Date('2023-01-01'),
        fechaActualizacion: new Date('2023-01-02'),
        ultimoAcceso: new Date('2023-01-03'),
        roles: [
          {
            idRol: 1,
            nombreRol: 'ADMIN',
            descripcionRol: 'Administrador del sistema',
            fechaAsignacion: new Date('2023-01-01'),
            activo: true
          },
          {
            idRol: 2,
            nombreRol: 'USER',
            descripcionRol: 'Usuario estándar',
            fechaAsignacion: new Date('2023-01-01'),
            activo: true
          }
        ]
      });
    });

    it('should handle usuario with no roles', () => {
      const usuarioSinRoles = { ...mockUsuario, roles: [] };
      const result = toUsuarioDetailResponseDto(usuarioSinRoles);

      expect(result.roles).toEqual([]);
    });
  });

  describe('toUsuarioDetailDto', () => {
    it('should map PrismaUsuarioConRoles to UsuarioDetailDto correctly', () => {
      const result = toUsuarioDetailDto(mockUsuario);

      expect(result).toEqual({
        idUsuario: 1,
        email: 'test@example.com',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
        fechaCreacion: new Date('2023-01-01'),
        fechaActualizacion: new Date('2023-01-02'),
        ultimoAcceso: new Date('2023-01-03'),
        roles: [
          {
            idRol: 1,
            nombreRol: 'ADMIN',
            descripcionRol: 'Administrador del sistema',
            fechaAsignacion: new Date('2023-01-01'),
            activo: true
          },
          {
            idRol: 2,
            nombreRol: 'USER',
            descripcionRol: 'Usuario estándar',
            fechaAsignacion: new Date('2023-01-01'),
            activo: true
          }
        ]
      });
    });

    it('should exclude password from mapped object', () => {
      const result = toUsuarioDetailDto(mockUsuario);

      expect(result).not.toHaveProperty('password');
    });
  });
});

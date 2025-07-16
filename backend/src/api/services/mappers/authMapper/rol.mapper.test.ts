import { describe, it, expect } from '@jest/globals';
import { toRolResponseDto, toRolesResponseDto } from './rol.mapper';
import { Rol as PrismaRol } from '@prisma/client';

describe('Rol Mapper', () => {
  const mockRol: PrismaRol = {
    idRol: 1,
    nombreRol: 'ADMIN',
    descripcionRol: 'Administrador del sistema',
    activo: true,
    fechaCreacion: new Date('2023-01-01')
  };

  const mockRoles: PrismaRol[] = [
    mockRol,
    {
      idRol: 2,
      nombreRol: 'USER',
      descripcionRol: 'Usuario estándar',
      activo: true,
      fechaCreacion: new Date('2023-01-02')
    },
    {
      idRol: 3,
      nombreRol: 'MODERATOR',
      descripcionRol: 'Moderador del sistema',
      activo: false,
      fechaCreacion: new Date('2023-01-03')
    }
  ];

  describe('toRolResponseDto', () => {
    it('should map PrismaRol to RolResponseDto correctly', () => {
      const result = toRolResponseDto(mockRol);

      expect(result).toEqual({
        idRol: 1,
        nombreRol: 'ADMIN',
        descripcionRol: 'Administrador del sistema',
        activo: true,
        fechaCreacion: new Date('2023-01-01')
      });
    });

    it('should handle inactive rol', () => {
      const inactiveRol = { ...mockRol, activo: false };
      const result = toRolResponseDto(inactiveRol);

      expect(result.activo).toBe(false);
    });
  });

  describe('toRolesResponseDto', () => {
    it('should map array of PrismaRol to array of RolResponseDto correctly', () => {
      const result = toRolesResponseDto(mockRoles);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        idRol: 1,
        nombreRol: 'ADMIN',
        descripcionRol: 'Administrador del sistema',
        activo: true,
        fechaCreacion: new Date('2023-01-01')
      });
      expect(result[1]).toEqual({
        idRol: 2,
        nombreRol: 'USER',
        descripcionRol: 'Usuario estándar',
        activo: true,
        fechaCreacion: new Date('2023-01-02')
      });
      expect(result[2]).toEqual({
        idRol: 3,
        nombreRol: 'MODERATOR',
        descripcionRol: 'Moderador del sistema',
        activo: false,
        fechaCreacion: new Date('2023-01-03')
      });
    });

    it('should handle empty array', () => {
      const result = toRolesResponseDto([]);

      expect(result).toEqual([]);
    });
  });
});

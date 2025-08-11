import { 
  toGrupoTelegramResponseDto, 
  toGrupoTelegramWithCursoDto,
  type PrismaGrupoTelegramConCurso 
} from './grupoTelegram.mapper';
import { GrupoTelegram as PrismaGrupoTelegram, Curso as PrismaCurso } from "@prisma/client";
import { Decimal } from '@prisma/client/runtime/library';

describe('GrupoTelegram Mapper', () => {
  
  const mockPrismaGrupoTelegram: PrismaGrupoTelegram = {
    idGrupoTelegram: 1,
    idCurso: 2,
    telegramGroupId: '-1001234567890',
    nombreGrupo: 'Grupo JS Básico',
    enlaceInvitacion: 'https://t.me/joinchat/test123',
    fechaCreacion: new Date('2025-01-15T10:00:00Z'),
    fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
    activo: true,
  };

  const mockPrismaCurso: PrismaCurso = {
    idCurso: 2,
    nombreCortoCurso: 'JS-2024',
    nombreCurso: 'JavaScript Básico',
    modalidadCurso: 'Virtual',
    descripcionCurso: 'Curso de JavaScript desde cero',
    valorCurso: new Decimal(299.99),
    fechaInicioCurso: new Date('2025-01-15T00:00:00Z'),
    fechaFinCurso: new Date('2025-03-15T00:00:00Z'),
  };

  const mockPrismaGrupoTelegramConCurso: PrismaGrupoTelegramConCurso = {
    ...mockPrismaGrupoTelegram,
    curso: mockPrismaCurso,
  };

  describe('toGrupoTelegramResponseDto', () => {
    
    // MAP-GTE-001: Mapear grupo telegram básico correctamente
    it('MAP-GTE-001: debe mapear correctamente un grupo telegram básico', () => {
      const result = toGrupoTelegramResponseDto(mockPrismaGrupoTelegram);
      
      expect(result).toEqual({
        idGrupoTelegram: 1,
        idCurso: 2,
        telegramGroupId: '-1001234567890',
        nombreGrupo: 'Grupo JS Básico',
        enlaceInvitacion: 'https://t.me/joinchat/test123',
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
        fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
        activo: true,
      });
    });

    // MAP-GTE-002: Mapear grupo telegram inactivo
    it('MAP-GTE-002: debe mapear correctamente un grupo telegram inactivo', () => {
      const grupoInactivo = { ...mockPrismaGrupoTelegram, activo: false };
      
      const result = toGrupoTelegramResponseDto(grupoInactivo);
      
      expect(result.activo).toBe(false);
      expect(result.idGrupoTelegram).toBe(1);
      expect(result.nombreGrupo).toBe('Grupo JS Básico');
    });

    // MAP-GTE-003: Mapear grupo con enlace null
    it('MAP-GTE-003: debe manejar correctamente enlace de invitación null', () => {
      const grupoSinEnlace = { ...mockPrismaGrupoTelegram, enlaceInvitacion: null as any };
      
      const result = toGrupoTelegramResponseDto(grupoSinEnlace);
      
      expect(result.enlaceInvitacion).toBe(null);
      expect(result.idGrupoTelegram).toBe(1);
    });

    // MAP-GTE-004: Mantener todas las propiedades requeridas
    it('MAP-GTE-004: debe mantener todas las propiedades requeridas', () => {
      const result = toGrupoTelegramResponseDto(mockPrismaGrupoTelegram);
      
      expect(result).toHaveProperty('idGrupoTelegram');
      expect(result).toHaveProperty('idCurso');
      expect(result).toHaveProperty('telegramGroupId');
      expect(result).toHaveProperty('nombreGrupo');
      expect(result).toHaveProperty('enlaceInvitacion');
      expect(result).toHaveProperty('fechaCreacion');
      expect(result).toHaveProperty('fechaActualizacion');
      expect(result).toHaveProperty('activo');
    });
  });

  describe('toGrupoTelegramWithCursoDto', () => {
    
    // MAP-GTE-005: Mapear grupo telegram con curso correctamente
    it('MAP-GTE-005: debe mapear correctamente grupo telegram con curso', () => {
      const result = toGrupoTelegramWithCursoDto(mockPrismaGrupoTelegramConCurso);
      
      expect(result).toEqual({
        idGrupoTelegram: 1,
        idCurso: 2,
        telegramGroupId: '-1001234567890',
        nombreGrupo: 'Grupo JS Básico',
        enlaceInvitacion: 'https://t.me/joinchat/test123',
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
        fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
        activo: true,
        curso: {
          idCurso: 2,
          nombreCortoCurso: 'JS-2024',
          nombreCurso: 'JavaScript Básico',
          modalidadCurso: 'Virtual',
          fechaInicioCurso: new Date('2025-01-15T00:00:00Z'),
          fechaFinCurso: new Date('2025-03-15T00:00:00Z'),
        },
      });
    });

    // MAP-GTE-006: Mapear con curso diferente modalidad
    it('MAP-GTE-006: debe mapear correctamente curso con modalidad presencial', () => {
      const cursoPresencial = { ...mockPrismaCurso, modalidadCurso: 'Presencial' };
      const grupoConCursoPresencial = { ...mockPrismaGrupoTelegramConCurso, curso: cursoPresencial };
      
      const result = toGrupoTelegramWithCursoDto(grupoConCursoPresencial);
      
      expect(result.curso.modalidadCurso).toBe('Presencial');
      expect(result.idGrupoTelegram).toBe(1);
    });

    // MAP-GTE-007: Mantener todas las propiedades del grupo y curso
    it('MAP-GTE-007: debe mantener todas las propiedades requeridas del grupo y curso', () => {
      const result = toGrupoTelegramWithCursoDto(mockPrismaGrupoTelegramConCurso);
      
      // Propiedades del grupo
      expect(result).toHaveProperty('idGrupoTelegram');
      expect(result).toHaveProperty('idCurso');
      expect(result).toHaveProperty('telegramGroupId');
      expect(result).toHaveProperty('nombreGrupo');
      expect(result).toHaveProperty('enlaceInvitacion');
      expect(result).toHaveProperty('fechaCreacion');
      expect(result).toHaveProperty('fechaActualizacion');
      expect(result).toHaveProperty('activo');
      
      // Propiedades del curso
      expect(result.curso).toHaveProperty('idCurso');
      expect(result.curso).toHaveProperty('nombreCortoCurso');
      expect(result.curso).toHaveProperty('nombreCurso');
      expect(result.curso).toHaveProperty('modalidadCurso');
      expect(result.curso).toHaveProperty('fechaInicioCurso');
      expect(result.curso).toHaveProperty('fechaFinCurso');
    });

    // MAP-GTE-008: Mapear con fechas diferentes
    it('MAP-GTE-008: debe manejar correctamente fechas diferentes de curso', () => {
      const cursoFuturo = { 
        ...mockPrismaCurso, 
        fechaInicioCurso: new Date('2025-06-01T00:00:00Z'),
        fechaFinCurso: new Date('2025-08-01T00:00:00Z'),
      };
      const grupoConCursoFuturo = { ...mockPrismaGrupoTelegramConCurso, curso: cursoFuturo };
      
      const result = toGrupoTelegramWithCursoDto(grupoConCursoFuturo);
      
      expect(result.curso.fechaInicioCurso).toEqual(new Date('2025-06-01T00:00:00Z'));
      expect(result.curso.fechaFinCurso).toEqual(new Date('2025-08-01T00:00:00Z'));
    });

    // MAP-GTE-009: Mapear con nombre corto de curso diferente
    it('MAP-GTE-009: debe mapear correctamente diferentes nombres cortos de curso', () => {
      const cursoReact = { 
        ...mockPrismaCurso, 
        nombreCortoCurso: 'REACT-2025',
        nombreCurso: 'React Avanzado',
      };
      const grupoConCursoReact = { ...mockPrismaGrupoTelegramConCurso, curso: cursoReact };
      
      const result = toGrupoTelegramWithCursoDto(grupoConCursoReact);
      
      expect(result.curso.nombreCortoCurso).toBe('REACT-2025');
      expect(result.curso.nombreCurso).toBe('React Avanzado');
    });

    // MAP-GTE-010: Verificar que no se filtran campos del curso original
    it('MAP-GTE-010: debe incluir solo los campos especificados del curso', () => {
      const result = toGrupoTelegramWithCursoDto(mockPrismaGrupoTelegramConCurso);
      
      // Verificar que no incluye campos no especificados
      expect(result.curso).not.toHaveProperty('descripcionCurso');
      expect(result.curso).not.toHaveProperty('valorCurso');
      
      // Verificar que incluye solo los campos especificados
      expect(Object.keys(result.curso)).toEqual([
        'idCurso',
        'nombreCortoCurso', 
        'nombreCurso',
        'modalidadCurso',
        'fechaInicioCurso',
        'fechaFinCurso'
      ]);
    });
  });
});
// Mocks separados para diferentes modelos
const mockUsuarioFindUnique = jest.fn();
const mockUsuarioCreate = jest.fn();
const mockUsuarioUpdate = jest.fn();
const mockUsuarioCount = jest.fn();
const mockUsuarioFindMany = jest.fn();
const mockRolFindMany = jest.fn();
const mockUsuarioRolCreateMany = jest.fn();
const mockUsuarioRolUpdateMany = jest.fn();
const mockSesionUsuarioUpdateMany = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    usuario: {
      create: mockUsuarioCreate,
      update: mockUsuarioUpdate,
      findMany: mockUsuarioFindMany,
      findUnique: mockUsuarioFindUnique,
      count: mockUsuarioCount,
    },
    rol: {
      findMany: mockRolFindMany,
    },
    usuarioRol: {
      createMany: mockUsuarioRolCreateMany,
      updateMany: mockUsuarioRolUpdateMany,
    },
    sesionUsuario: {
      updateMany: mockSesionUsuarioUpdateMany,
    },
  })),
}));

// Mock de bcrypt
const mockBcryptHash = jest.fn();
jest.mock('bcryptjs', () => ({
  hash: mockBcryptHash,
}));

// Mock del logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};
jest.mock('@/utils/logger', () => ({
  logger: mockLogger,
}));

// Mock de los mappers
const mockToUsuarioDetailDto = jest.fn();
jest.mock('@/api/services/mappers', () => ({
  toUsuarioDetailDto: mockToUsuarioDetailDto,
}));

import { UsuarioService } from '@/api/services/authService/usuario.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from '@/api/dtos/authDto/usuario.dto';
import { NotFoundError, ConflictError } from '@/utils/errorTypes';

describe('UsuarioService', () => {
  let usuarioService: UsuarioService;

  beforeEach(() => {
    usuarioService = new UsuarioService();
    jest.clearAllMocks();
    
    // Resetear todos los mocks
    mockUsuarioCreate.mockReset();
    mockUsuarioUpdate.mockReset();
    mockUsuarioFindMany.mockReset();
    mockUsuarioFindUnique.mockReset();
    mockUsuarioCount.mockReset();
    mockRolFindMany.mockReset();
    mockUsuarioRolCreateMany.mockReset();
    mockUsuarioRolUpdateMany.mockReset();
    mockSesionUsuarioUpdateMany.mockReset();
    mockBcryptHash.mockReset();
    mockToUsuarioDetailDto.mockReset();
    mockLogger.info.mockReset();
    mockLogger.error.mockReset();
    
    // Mock por defecto del mapper
    mockToUsuarioDetailDto.mockImplementation((usuario) => ({
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      activo: usuario.activo,
      fechaCreacion: usuario.fechaCreacion,
      roles: usuario.roles?.map((ur: any) => ({
        idRol: ur.rol.idRol,
        nombre: ur.rol.nombre,
        descripcion: ur.rol.descripcion,
      })) || [],
    }));
  });

  describe('createUsuario', () => {
    const createUsuarioDto: CreateUsuarioDto = {
      email: 'test@example.com',
      password: 'password123',
      nombres: 'Juan',
      apellidos: 'Pérez',
      activo: true,
      roleIds: [1, 2],
    };

    // SRV-USR-001: Crear usuario exitosamente
    it('SRV-USR-001: debería crear un usuario exitosamente', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const nuevoUsuario = {
        idUsuario: 1,
        email: 'test@example.com',
        password: hashedPassword,
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
        fechaCreacion: new Date(),
      };

      const usuarioCompleto = {
        ...nuevoUsuario,
        roles: [
          { rol: { idRol: 1, nombre: 'Admin', descripcion: 'Administrador' } },
          { rol: { idRol: 2, nombre: 'User', descripcion: 'Usuario' } },
        ],
      };

      const expectedResponse = {
        idUsuario: 1,
        email: 'test@example.com',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
        fechaCreacion: nuevoUsuario.fechaCreacion,
        roles: [
          { idRol: 1, nombre: 'Admin', descripcion: 'Administrador' },
          { idRol: 2, nombre: 'User', descripcion: 'Usuario' },
        ],
      };

      mockUsuarioFindUnique
        .mockResolvedValueOnce(null) // No existe usuario con ese email
        .mockResolvedValueOnce(usuarioCompleto); // Usuario completo después de creación
      mockBcryptHash.mockResolvedValue(hashedPassword);
      mockUsuarioCreate.mockResolvedValue(nuevoUsuario);
      mockRolFindMany.mockResolvedValue([
        { idRol: 1, nombre: 'Admin', activo: true },
        { idRol: 2, nombre: 'User', activo: true },
      ]);
      mockUsuarioRolCreateMany.mockResolvedValue({ count: 2 });
      mockToUsuarioDetailDto.mockReturnValue(expectedResponse);

      // Act
      const result = await usuarioService.createUsuario(createUsuarioDto);

      // Assert
      expect(mockUsuarioFindUnique).toHaveBeenCalledWith({
        where: { email: createUsuarioDto.email },
      });
      expect(mockBcryptHash).toHaveBeenCalledWith(createUsuarioDto.password, 10);
      expect(mockUsuarioCreate).toHaveBeenCalledWith({
        data: {
          email: createUsuarioDto.email,
          password: hashedPassword,
          nombres: createUsuarioDto.nombres,
          apellidos: createUsuarioDto.apellidos,
          activo: true,
        },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Usuario creado exitosamente: test@example.com',
        { userId: 1 }
      );
      expect(result).toEqual(expectedResponse);
    });

    // SRV-USR-002: Error cuando email ya existe
    it('SRV-USR-002: debería lanzar ConflictError cuando el email ya existe', async () => {
      // Arrange
      const usuarioExistente = {
        idUsuario: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        nombres: 'Otro',
        apellidos: 'Usuario',
        activo: true,
      };

      mockUsuarioFindUnique.mockResolvedValue(usuarioExistente);

      // Act & Assert
      await expect(usuarioService.createUsuario(createUsuarioDto))
        .rejects.toThrow(ConflictError);
      await expect(usuarioService.createUsuario(createUsuarioDto))
        .rejects.toThrow('Ya existe un usuario con este email');
    });

    // SRV-USR-003: Crear usuario sin roles
    it('SRV-USR-003: debería crear un usuario sin roles exitosamente', async () => {
      // Arrange
      const createUsuarioSinRoles: CreateUsuarioDto = {
        email: 'test@example.com',
        password: 'password123',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
      };

      const nuevoUsuario = {
        idUsuario: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
        fechaCreacion: new Date(),
      };

      const usuarioCompleto = {
        ...nuevoUsuario,
        roles: [],
      };

      mockUsuarioFindUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(usuarioCompleto);
      mockBcryptHash.mockResolvedValue('hashedPassword123');
      mockUsuarioCreate.mockResolvedValue(nuevoUsuario);
      mockToUsuarioDetailDto.mockReturnValue({
        ...nuevoUsuario,
        roles: [],
      });

      // Act
      const result = await usuarioService.createUsuario(createUsuarioSinRoles);

      // Assert
      expect(mockUsuarioRolCreateMany).not.toHaveBeenCalled();
      expect(result.roles).toEqual([]);
    });
  });

  describe('getAllUsuarios', () => {
    // SRV-USR-004: Obtener todos los usuarios con paginación
    it('SRV-USR-004: debería obtener todos los usuarios con paginación', async () => {
      // Arrange
      const usuarios = [
        {
          idUsuario: 1,
          email: 'user1@example.com',
          nombres: 'Usuario',
          apellidos: 'Uno',
          activo: true,
          fechaCreacion: new Date(),
          roles: [],
        },
        {
          idUsuario: 2,
          email: 'user2@example.com',
          nombres: 'Usuario',
          apellidos: 'Dos',
          activo: true,
          fechaCreacion: new Date(),
          roles: [],
        },
      ];

      const total = 15;
      const page = 1;
      const limit = 10;

      mockUsuarioFindMany.mockResolvedValue(usuarios);
      mockUsuarioCount.mockResolvedValue(total);
      mockToUsuarioDetailDto
        .mockReturnValueOnce({ ...usuarios[0], roles: [] })
        .mockReturnValueOnce({ ...usuarios[1], roles: [] });

      // Act
      const result = await usuarioService.getAllUsuarios(page, limit);

      // Assert
      expect(mockUsuarioFindMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          roles: {
            include: { rol: true },
            where: { activo: true },
          },
        },
        orderBy: { fechaCreacion: 'desc' },
      });
      expect(result).toEqual({
        usuarios: [
          { ...usuarios[0], roles: [] },
          { ...usuarios[1], roles: [] },
        ],
        total: 15,
        totalPages: 2,
        currentPage: 1,
      });
    });
  });

  describe('getUsuarioById', () => {
    // SRV-USR-005: Obtener usuario por ID exitosamente
    it('SRV-USR-005: debería obtener un usuario por ID exitosamente', async () => {
      // Arrange
      const usuarioId = 1;
      const usuario = {
        idUsuario: 1,
        email: 'test@example.com',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
        fechaCreacion: new Date(),
        roles: [],
      };

      mockUsuarioFindUnique.mockResolvedValue(usuario);
      mockToUsuarioDetailDto.mockReturnValue(usuario);

      // Act
      const result = await usuarioService.getUsuarioById(usuarioId);

      // Assert
      expect(mockUsuarioFindUnique).toHaveBeenCalledWith({
        where: { idUsuario: usuarioId },
        include: {
          roles: {
            include: { rol: true },
            where: { activo: true },
          },
        },
      });
      expect(result).toEqual(usuario);
    });

    // SRV-USR-006: Error cuando usuario no existe
    it('SRV-USR-006: debería lanzar NotFoundError cuando el usuario no existe', async () => {
      // Arrange
      const usuarioId = 999;
      mockUsuarioFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(usuarioService.getUsuarioById(usuarioId))
        .rejects.toThrow(NotFoundError);
      await expect(usuarioService.getUsuarioById(usuarioId))
        .rejects.toThrow('Usuario con ID 999');
    });
  });

  describe('updateUsuario', () => {
    const updateUsuarioDto: UpdateUsuarioDto = {
      email: 'updated@example.com',
      nombres: 'Juan Actualizado',
      roleIds: [1],
    };

    // SRV-USR-007: Actualizar usuario exitosamente
    it('SRV-USR-007: debería actualizar un usuario exitosamente', async () => {
      // Arrange
      const usuarioId = 1;
      const usuarioExistente = {
        idUsuario: 1,
        email: 'old@example.com',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
      };

      const usuarioActualizado = {
        idUsuario: 1,
        email: 'updated@example.com',
        nombres: 'Juan Actualizado',
        apellidos: 'Pérez',
        activo: true,
        fechaCreacion: new Date(),
        roles: [],
      };

      mockUsuarioFindUnique
        .mockResolvedValueOnce(usuarioExistente) // Usuario existente
        .mockResolvedValueOnce(null) // Email no existe en otro usuario
        .mockResolvedValueOnce(usuarioActualizado); // Usuario actualizado

      mockUsuarioUpdate.mockResolvedValue(usuarioActualizado);
      mockUsuarioRolUpdateMany.mockResolvedValue({ count: 1 });
      mockRolFindMany.mockResolvedValue([{ idRol: 1, activo: true }]);
      mockUsuarioRolCreateMany.mockResolvedValue({ count: 1 });
      mockToUsuarioDetailDto.mockReturnValue(usuarioActualizado);

      // Act
      const result = await usuarioService.updateUsuario(usuarioId, updateUsuarioDto);

      // Assert
      expect(mockUsuarioUpdate).toHaveBeenCalledWith({
        where: { idUsuario: usuarioId },
        data: {
          email: updateUsuarioDto.email,
          nombres: updateUsuarioDto.nombres,
        },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Usuario actualizado exitosamente: updated@example.com',
        { userId: usuarioId }
      );
      expect(result).toEqual(usuarioActualizado);
    });

    // SRV-USR-008: Error cuando usuario no existe
    it('SRV-USR-008: debería lanzar NotFoundError cuando el usuario no existe', async () => {
      // Arrange
      const usuarioId = 999;
      mockUsuarioFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(usuarioService.updateUsuario(usuarioId, updateUsuarioDto))
        .rejects.toThrow(NotFoundError);
      await expect(usuarioService.updateUsuario(usuarioId, updateUsuarioDto))
        .rejects.toThrow('Usuario con ID 999');
    });

    // SRV-USR-009: Error cuando email ya existe en otro usuario
    it('SRV-USR-009: debería lanzar ConflictError cuando el email ya existe en otro usuario', async () => {
      // Arrange
      const usuarioId = 1;
      const usuarioExistente = {
        idUsuario: 1,
        email: 'old@example.com',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
      };

      const otroUsuario = {
        idUsuario: 2,
        email: 'updated@example.com',
        nombres: 'Otro',
        apellidos: 'Usuario',
        activo: true,
      };

      // Mock sequence: first call finds existing user, second call finds email conflict
      mockUsuarioFindUnique
        .mockResolvedValueOnce(usuarioExistente) // Usuario existente
        .mockResolvedValueOnce(otroUsuario); // Email ya existe en otro usuario

      // Act & Assert
      const promise = usuarioService.updateUsuario(usuarioId, updateUsuarioDto);
      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow('Ya existe un usuario con este email');
    });
  });

  describe('deleteUsuario', () => {
    // SRV-USR-010: Eliminar usuario exitosamente (soft delete)
    it('SRV-USR-010: debería eliminar un usuario exitosamente (soft delete)', async () => {
      // Arrange
      const usuarioId = 1;
      const usuario = {
        idUsuario: 1,
        email: 'test@example.com',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
      };

      mockUsuarioFindUnique.mockResolvedValue(usuario);
      mockUsuarioUpdate.mockResolvedValue({ ...usuario, activo: false });
      mockSesionUsuarioUpdateMany.mockResolvedValue({ count: 2 });

      // Act
      await usuarioService.deleteUsuario(usuarioId);

      // Assert
      expect(mockUsuarioUpdate).toHaveBeenCalledWith({
        where: { idUsuario: usuarioId },
        data: { activo: false },
      });
      expect(mockSesionUsuarioUpdateMany).toHaveBeenCalledWith({
        where: { idUsuario: usuarioId },
        data: { activo: false },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Usuario eliminado (soft delete): test@example.com',
        { userId: usuarioId }
      );
    });

    // SRV-USR-011: Error cuando usuario no existe
    it('SRV-USR-011: debería lanzar NotFoundError cuando el usuario no existe', async () => {
      // Arrange
      const usuarioId = 999;
      mockUsuarioFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(usuarioService.deleteUsuario(usuarioId))
        .rejects.toThrow(NotFoundError);
      await expect(usuarioService.deleteUsuario(usuarioId))
        .rejects.toThrow('Usuario con ID 999');
    });
  });
});

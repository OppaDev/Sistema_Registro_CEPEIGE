import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CreateUsuarioDto, UpdateUsuarioDto, UsuarioDetailResponseDto } from '@/api/dtos/authDto/usuario.dto';
import { BadRequestError, NotFoundError, ConflictError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';

export class UsuarioService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Crear un nuevo usuario
   */
  async createUsuario(createDto: CreateUsuarioDto): Promise<UsuarioDetailResponseDto> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: createDto.email }
      });

      if (existingUser) {
        throw new ConflictError('Ya existe un usuario con este email');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(createDto.password, 10);

      // Crear el usuario
      const usuario = await this.prisma.usuario.create({
        data: {
          email: createDto.email,
          password: hashedPassword,
          nombres: createDto.nombres,
          apellidos: createDto.apellidos,
          activo: createDto.activo ?? true
        }
      });

      // Asignar roles si se proporcionaron
      if (createDto.roleIds && createDto.roleIds.length > 0) {
        await this.assignRolesToUser(usuario.idUsuario, createDto.roleIds);
      }

      // Obtener el usuario completo con roles
      const usuarioCompleto = await this.getUsuarioById(usuario.idUsuario);

      logger.info(`Usuario creado exitosamente: ${usuario.email}`, { userId: usuario.idUsuario });

      return usuarioCompleto;

    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      logger.error('Error en UsuarioService.createUsuario:', error);
      throw new BadRequestError('Error al crear el usuario');
    }
  }

  /**
   * Obtener todos los usuarios con paginación
   */
  async getAllUsuarios(page: number = 1, limit: number = 10): Promise<{
    usuarios: UsuarioDetailResponseDto[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [usuarios, total] = await Promise.all([
        this.prisma.usuario.findMany({
          skip,
          take: limit,
          include: {
            roles: {
              include: {
                rol: true
              },
              where: { activo: true }
            }
          },
          orderBy: {
            fechaCreacion: 'desc'
          }
        }),
        this.prisma.usuario.count()
      ]);

      const usuariosFormateados = usuarios.map(usuario => ({
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
      }));

      return {
        usuarios: usuariosFormateados,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };

    } catch (error) {
      logger.error('Error en UsuarioService.getAllUsuarios:', error);
      throw new BadRequestError('Error al obtener usuarios');
    }
  }

  /**
   * Obtener un usuario por ID
   */
  async getUsuarioById(id: number): Promise<UsuarioDetailResponseDto> {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { idUsuario: id },
        include: {
          roles: {
            include: {
              rol: true
            },
            where: { activo: true }
          }
        }
      });

      if (!usuario) {
        throw new NotFoundError(`Usuario con ID ${id}`);
      }

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

    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error en UsuarioService.getUsuarioById:', error);
      throw new BadRequestError('Error al obtener el usuario');
    }
  }

  /**
   * Actualizar un usuario
   */
  async updateUsuario(id: number, updateDto: UpdateUsuarioDto): Promise<UsuarioDetailResponseDto> {
    try {
      // Verificar que el usuario existe
      const existingUser = await this.prisma.usuario.findUnique({
        where: { idUsuario: id }
      });

      if (!existingUser) {
        throw new NotFoundError(`Usuario con ID ${id}`);
      }

      // Verificar email único si se va a cambiar
      if (updateDto.email && updateDto.email !== existingUser.email) {
        const emailExists = await this.prisma.usuario.findUnique({
          where: { email: updateDto.email }
        });

        if (emailExists) {
          throw new ConflictError('Ya existe un usuario con este email');
        }
      }

      // Preparar datos de actualización
      const updateData: any = {};

      if (updateDto.email) updateData.email = updateDto.email;
      if (updateDto.nombres) updateData.nombres = updateDto.nombres;
      if (updateDto.apellidos) updateData.apellidos = updateDto.apellidos;
      if (updateDto.activo !== undefined) updateData.activo = updateDto.activo;

      // Hashear nueva contraseña si se proporciona
      if (updateDto.password) {
        updateData.password = await bcrypt.hash(updateDto.password, 10);
      }

      // Actualizar el usuario
      await this.prisma.usuario.update({
        where: { idUsuario: id },
        data: updateData
      });

      // Actualizar roles si se proporcionaron
      if (updateDto.roleIds !== undefined) {
        await this.updateUserRoles(id, updateDto.roleIds);
      }

      // Obtener el usuario actualizado
      const usuarioActualizado = await this.getUsuarioById(id);

      logger.info(`Usuario actualizado exitosamente: ${usuarioActualizado.email}`, { userId: id });

      return usuarioActualizado;

    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      logger.error('Error en UsuarioService.updateUsuario:', error);
      throw new BadRequestError('Error al actualizar el usuario');
    }
  }

  /**
   * Eliminar un usuario (soft delete)
   */
  async deleteUsuario(id: number): Promise<void> {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { idUsuario: id }
      });

      if (!usuario) {
        throw new NotFoundError(`Usuario con ID ${id}`);
      }

      // Soft delete: marcar como inactivo
      await this.prisma.usuario.update({
        where: { idUsuario: id },
        data: { activo: false }
      });

      // Desactivar todas las sesiones del usuario
      await this.prisma.sesionUsuario.updateMany({
        where: { idUsuario: id },
        data: { activo: false }
      });

      logger.info(`Usuario eliminado (soft delete): ${usuario.email}`, { userId: id });

    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error en UsuarioService.deleteUsuario:', error);
      throw new BadRequestError('Error al eliminar el usuario');
    }
  }

  /**
   * Asignar roles a un usuario
   */
  private async assignRolesToUser(userId: number, roleIds: number[]): Promise<void> {
    try {
      // Verificar que todos los roles existen
      const roles = await this.prisma.rol.findMany({
        where: { 
          idRol: { in: roleIds },
          activo: true
        }
      });

      if (roles.length !== roleIds.length) {
        throw new BadRequestError('Uno o más roles no existen o están inactivos');
      }

      // Crear las asignaciones de roles
      const roleAssignments = roleIds.map(roleId => ({
        idUsuario: userId,
        idRol: roleId,
        activo: true
      }));

      await this.prisma.usuarioRol.createMany({
        data: roleAssignments,
        skipDuplicates: true
      });

    } catch (error) {
      logger.error('Error en assignRolesToUser:', error);
      throw error;
    }
  }

  /**
   * Actualizar roles de un usuario
   */
  private async updateUserRoles(userId: number, newRoleIds: number[]): Promise<void> {
    try {
      // Desactivar todos los roles actuales
      await this.prisma.usuarioRol.updateMany({
        where: { idUsuario: userId },
        data: { activo: false }
      });

      // Asignar nuevos roles si se proporcionaron
      if (newRoleIds.length > 0) {
        await this.assignRolesToUser(userId, newRoleIds);
      }

    } catch (error) {
      logger.error('Error en updateUserRoles:', error);
      throw error;
    }
  }
}

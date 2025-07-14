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
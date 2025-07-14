import { validate } from 'class-validator';
import { CreateDatosPersonalesDto } from '@/api/dtos/inscripcionDto/datosPersonales.dto';

describe('CreateDatosPersonalesDto - CI/Pasaporte Integration', () => {
  
  describe('Validación de campo ciPasaporte', () => {
    it('debería validar exitosamente con cédula ecuatoriana válida', async () => {
      const dto = new CreateDatosPersonalesDto();
      dto.ciPasaporte = '0402084040'; // Cédula válida
      dto.nombres = 'Juan Carlos';
      dto.apellidos = 'Pérez González';
      dto.numTelefono = '0987654321';
      dto.correo = 'juan@example.com';
      dto.pais = 'Ecuador';
      dto.provinciaEstado = 'Pichincha';
      dto.ciudad = 'Quito';
      dto.profesion = 'Ingeniero';
      dto.institucion = 'Universidad Central';

      const errors = await validate(dto);
      const ciErrors = errors.filter(error => error.property === 'ciPasaporte');
      
      expect(ciErrors).toHaveLength(0);
    });

    it('debería validar exitosamente con pasaporte válido', async () => {
      const dto = new CreateDatosPersonalesDto();
      dto.ciPasaporte = 'AB123456'; // Pasaporte válido
      dto.nombres = 'John';
      dto.apellidos = 'Smith';
      dto.numTelefono = '0987654321';
      dto.correo = 'john@example.com';
      dto.pais = 'Estados Unidos';
      dto.provinciaEstado = 'California';
      dto.ciudad = 'Los Angeles';
      dto.profesion = 'Doctor';
      dto.institucion = 'UCLA';

      const errors = await validate(dto);
      const ciErrors = errors.filter(error => error.property === 'ciPasaporte');
      
      expect(ciErrors).toHaveLength(0);
    });

    it('debería rechazar cédula ecuatoriana inválida', async () => {
      const dto = new CreateDatosPersonalesDto();
      dto.ciPasaporte = '1234567890'; // Cédula inválida
      dto.nombres = 'Juan Carlos';
      dto.apellidos = 'Pérez González';
      dto.numTelefono = '0987654321';
      dto.correo = 'juan@example.com';
      dto.pais = 'Ecuador';
      dto.provinciaEstado = 'Pichincha';
      dto.ciudad = 'Quito';
      dto.profesion = 'Ingeniero';
      dto.institucion = 'Universidad Central';

      const errors = await validate(dto);
      const ciErrors = errors.filter(error => error.property === 'ciPasaporte');
        expect(ciErrors).toHaveLength(1);
      expect(ciErrors[0].constraints).toHaveProperty('IsCiPasaporteConstraint');
      expect(ciErrors[0].constraints!['IsCiPasaporteConstraint']).toBe(
        'Debe ingresar una cédula ecuatoriana válida (10 dígitos) o un pasaporte válido (6-9 caracteres alfanuméricos en mayúsculas)'
      );
    });

    it('debería rechazar pasaporte inválido', async () => {
      const dto = new CreateDatosPersonalesDto();
      dto.ciPasaporte = 'ab123'; // Pasaporte inválido (minúsculas y muy corto)
      dto.nombres = 'John';
      dto.apellidos = 'Smith';
      dto.numTelefono = '0987654321';
      dto.correo = 'john@example.com';
      dto.pais = 'Estados Unidos';
      dto.provinciaEstado = 'California';
      dto.ciudad = 'Los Angeles';
      dto.profesion = 'Doctor';
      dto.institucion = 'UCLA';

      const errors = await validate(dto);
      const ciErrors = errors.filter(error => error.property === 'ciPasaporte');
        expect(ciErrors).toHaveLength(1);
      expect(ciErrors[0].constraints).toHaveProperty('IsCiPasaporteConstraint');
    });

    it('debería rechazar campo vacío', async () => {
      const dto = new CreateDatosPersonalesDto();
      dto.ciPasaporte = ''; // Vacío
      dto.nombres = 'Juan Carlos';
      dto.apellidos = 'Pérez González';
      dto.numTelefono = '0987654321';
      dto.correo = 'juan@example.com';
      dto.pais = 'Ecuador';
      dto.provinciaEstado = 'Pichincha';
      dto.ciudad = 'Quito';
      dto.profesion = 'Ingeniero';
      dto.institucion = 'Universidad Central';

      const errors = await validate(dto);
      const ciErrors = errors.filter(error => error.property === 'ciPasaporte');
      
      expect(ciErrors).toHaveLength(1);
      expect(ciErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería mostrar mensaje personalizado cuando se proporciona', async () => {
      const dto = new CreateDatosPersonalesDto();
      dto.ciPasaporte = '12345'; // Muy corto para pasaporte y muy corto para cédula
      dto.nombres = 'Juan Carlos';
      dto.apellidos = 'Pérez González';
      dto.numTelefono = '0987654321';
      dto.correo = 'juan@example.com';
      dto.pais = 'Ecuador';
      dto.provinciaEstado = 'Pichincha';
      dto.ciudad = 'Quito';
      dto.profesion = 'Ingeniero';
      dto.institucion = 'Universidad Central';

      const errors = await validate(dto);
      const ciErrors = errors.filter(error => error.property === 'ciPasaporte');
      
      expect(ciErrors).toHaveLength(1);      expect(ciErrors[0].constraints!['IsCiPasaporteConstraint']).toBe(
        'Debe ingresar una cédula ecuatoriana válida (10 dígitos) o un pasaporte válido (6-9 caracteres alfanuméricos en mayúsculas)'
      );
    });
  });
});

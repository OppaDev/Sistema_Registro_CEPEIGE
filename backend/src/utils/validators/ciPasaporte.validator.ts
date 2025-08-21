import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CedulaEcuatorianaValidator } from '@/utils/cedulaValidator';

@ValidatorConstraint({ async: false })
export class IsCiPasaporteConstraint implements ValidatorConstraintInterface {  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    // Limpiar espacios al inicio y final
    const cleanValue = value.trim();
    
    if (!cleanValue) {
      return false;
    }

    // Verificar si es una cédula ecuatoriana (exactamente 10 dígitos numéricos)
    if (/^\d{10}$/.test(cleanValue)) {
      return CedulaEcuatorianaValidator.isValid(cleanValue);
    }

    // Verificar si es un pasaporte (6-15 caracteres alfanuméricos en mayúsculas)
    if (/^[A-Z0-9]{6,15}$/.test(cleanValue)) {
      // Permitir pasaportes numéricos de 6-15 dígitos (como pasaportes de Estados Unidos)
      if (/^\d{6,15}$/.test(cleanValue)) {
        return true; // Pasaportes numéricos válidos
      }
      // También permitir pasaportes alfanuméricos
      return true;
    }

    // Si no cumple ninguno de los dos formatos
    return false;
  }

  defaultMessage(): string {
    return 'Debe ingresar una cédula ecuatoriana válida (10 dígitos) o un pasaporte válido (6-15 caracteres alfanuméricos)';
  }
}

/**
 * Decorador personalizado para validar CI o Pasaporte
 * - Cédula ecuatoriana: 10 dígitos numéricos con validación de dígito verificador
 * - Pasaporte: 6-9 caracteres alfanuméricos en mayúsculas
 * @param validationOptions - Opciones de validación adicionales
 * @returns Decorador de validación
 */
export function IsCiPasaporte(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [],
      validator: IsCiPasaporteConstraint,
    });
  };
}

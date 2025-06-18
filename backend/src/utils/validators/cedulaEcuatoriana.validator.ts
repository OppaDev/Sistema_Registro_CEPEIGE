import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CedulaEcuatorianaValidator, CEDULA_ERROR_MESSAGE } from '@/utils/cedulaValidator';

@ValidatorConstraint({ async: false })
export class IsCedulaEcuatorianaConstraint implements ValidatorConstraintInterface {
  validate(cedula: string): boolean {
    if (!cedula || typeof cedula !== 'string') {
      return false;
    }
    return CedulaEcuatorianaValidator.isValid(cedula);
  }

  defaultMessage(): string {
    return CEDULA_ERROR_MESSAGE;
  }
}

/**
 * Decorador personalizado para validar cédula ecuatoriana
 * @param validationOptions - Opciones de validación adicionales
 * @returns Decorador de validación
 */
export function IsCedulaEcuatoriana(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [],
      validator: IsCedulaEcuatorianaConstraint,
    });
  };
}

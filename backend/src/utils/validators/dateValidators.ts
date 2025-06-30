import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsDateBefore(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isDateBefore",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions || {},
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!value || !relatedValue) {
            return true; // Si alguna fecha no está presente, no validamos aquí
          }

          const startDate = new Date(value);
          const endDate = new Date(relatedValue);

          // Si alguna de las fechas es inválida, no validamos aquí (otras validaciones deben manejar fechas inválidas)
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return true;
          }

          return startDate <= endDate;
        },
      },
    });
  };
}

export function IsDateAfter(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isDateAfter",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions || {},
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!value || !relatedValue) {
            return true; // Si alguna fecha no está presente, no validamos aquí
          }

          const endDate = new Date(value);
          const startDate = new Date(relatedValue);

          // Si alguna de las fechas es inválida, no validamos aquí (otras validaciones deben manejar fechas inválidas)
          if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
            return true;
          }

          return endDate >= startDate;
        },
      },
    });
  };
}

export function IsDateFromToday(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isDateFromToday",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: {
        validate(value: any) {
          if (!value || value === null || value === undefined) {
            return true; // Si la fecha no está presente, no validamos aquí
          }

          // Si es string, verificar si está vacío o solo espacios
          if (typeof value === 'string' && value.trim() === '') {
            return true; // Tratar cadenas vacías como valores ausentes
          }

          const inputDate = new Date(value);
          
          // Verificar si la fecha es válida
          if (isNaN(inputDate.getTime())) {
            return false; // Fecha inválida
          }
          
          const today = new Date();
          
          // Normalizar las fechas para comparar solo día, mes y año (sin horas)
          today.setHours(0, 0, 0, 0);
          inputDate.setHours(0, 0, 0, 0);

          return inputDate >= today;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser una fecha válida mayor o igual a la fecha actual`;
        },
      },
    });
  };
}

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
      options: validationOptions || {},      validator: {
        validate(value: any) {
          if (!value) {
            return true; // Si la fecha no está presente, no validamos aquí
          }

          const inputDate = new Date(value);
          const today = new Date();
          
          // Normalizar las fechas para comparar solo día, mes y año (sin horas)
          today.setHours(0, 0, 0, 0);
          inputDate.setHours(0, 0, 0, 0);

          return inputDate >= today;
        },
      },
    });
  };
}

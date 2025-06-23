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

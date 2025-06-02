import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass, ClassTransformOptions } from 'class-transformer';

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    const transformOptions: ClassTransformOptions = {
      enableImplicitConversion: true,
    };

    const dtoObject = plainToClass(dtoClass, req.body, transformOptions);
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => ({
        property: error.property,
        constraints: error.constraints
      }));

      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errorMessages
      });
    }

    req.body = dtoObject;
    return next();
  };
};
import { Request, Response, NextFunction } from 'express';
import * as exampleService from '../services/example.service';

export const getExampleData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await exampleService.fetchExampleData();
    res.status(200).json({ message: 'Example data fetched successfully', data });
  } catch (error) {
    next(error); // Pasa el error al middleware de manejo de errores
  }
};
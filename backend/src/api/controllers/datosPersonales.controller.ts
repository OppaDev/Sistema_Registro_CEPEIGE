import { Request, Response } from 'express';
import { CreateDatosPersonalesDto } from '@/api/dtos/datosPersonales.dto';
import { DatosPersonalesService } from '@/api/services/datosPersonales.service';

const datosPersonalesService = new DatosPersonalesService();

export class DatosPersonalesController {
  // Crear nuevos datos personales
  async create(req: Request, res: Response) {
    try {
      const datosPersonalesData: CreateDatosPersonalesDto = req.body;
      const datosPersonales = await datosPersonalesService.createDatosPersonales(datosPersonalesData);

      return res.status(201).json({
        success: true,
        data: datosPersonales,
        message: 'Datos personales creados exitosamente',
      });
    } catch (error) {
      console.error('Error al crear los datos personales:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear los datos personales',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
}
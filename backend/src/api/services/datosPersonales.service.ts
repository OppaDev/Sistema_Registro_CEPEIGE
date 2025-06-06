import { PrismaClient } from "@prisma/client";
import {
    CreateDatosPersonalesDto
} from "@/api/dtos/datosPersonales.dto"

const prisma = new PrismaClient();


export class DatosPersonalesService {
    //crear nuevos datos personales 
    async createDatosPersonales(datosPersonalesData: CreateDatosPersonalesDto) {
        try {
            const datosPersonales = await prisma.datosPersonales.create({
                data: {
                    ciPasaporte: datosPersonalesData.ciPasaporte,
                    nombres: datosPersonalesData.nombres,
                    apellidos: datosPersonalesData.apellidos,
                    numTelefono: datosPersonalesData.numTelefono,
                    correo: datosPersonalesData.correo,
                    pais: datosPersonalesData.pais,
                    provinciaEstado: datosPersonalesData.provinciaEstado,
                    ciudad: datosPersonalesData.ciudad,
                    profesion: datosPersonalesData.profesion,
                    institucion: datosPersonalesData.institucion,               
                },
            });
            return datosPersonales;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al crear los datos personales: ${error.message}`);
            }
            throw new Error("Error desconocido al crear los datos personales");
        }
    }

}
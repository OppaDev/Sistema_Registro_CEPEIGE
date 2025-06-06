import { PrismaClient } from "@prisma/client";
import {
    CreateDatosPersonalesDto,
    DatosPersonalesResponseDto
} from "@/api/dtos/datosPersonales.dto"

const prisma = new PrismaClient();


export class DatosPersonalesService {
    // Función privada para mapear el modelo de Prisma al DTO de respuesta
    private toDatosPersonalesResponseDto(datos: any): DatosPersonalesResponseDto {
        return {
            idDatosPersonales: datos.idDatosPersonales,
            ciPasaporte: datos.ciPasaporte,
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            numTelefono: datos.numTelefono,
            correo: datos.correo,
            pais: datos.pais,
            provinciaEstado: datos.provinciaEstado,
            ciudad: datos.ciudad,
            profesion: datos.profesion,
            institucion: datos.institucion,
        };
    }

    //crear nuevos datos personales 
    async createDatosPersonales(datosPersonalesData: CreateDatosPersonalesDto): Promise<DatosPersonalesResponseDto> {
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
            return this.toDatosPersonalesResponseDto(datosPersonales);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al crear los datos personales: ${error.message}`);
            }
            throw new Error("Error desconocido al crear los datos personales");
        }
    }

}
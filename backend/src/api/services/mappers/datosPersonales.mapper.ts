import { DatosPersonales as PrismaDatosPersonales } from "@prisma/client";
import { DatosPersonalesResponseDto } from "@/api/dtos/datosPersonales.dto";

export const toDatosPersonalesResponseDto = (datos: PrismaDatosPersonales): DatosPersonalesResponseDto => {
  return {
    idPersona: datos.idPersona,
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
};

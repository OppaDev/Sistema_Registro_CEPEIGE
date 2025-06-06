import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDatosPersonalesDto {
    @IsString()
    @IsNotEmpty({ message: 'CI o Pasaporte es requerido' })
    ciPasaporte!: string;

    @IsString()
    @IsNotEmpty({ message: 'Los nombres son requeridos' })
    nombres!: string;

    @IsString()
    @IsNotEmpty({ message: 'Los apellidos son requeridos' })
    apellidos!: string;

    @IsString()
    @IsNotEmpty({ message: 'El número de telefono es requerido' })
    numTelefono!: string;

    @IsString()
    @IsNotEmpty({ message: 'El correo es requerido' })
    correo!: string;

    @IsString()
    @IsNotEmpty({ message: 'El pais es requerido' })
    pais!: string;

    @IsString()
    @IsNotEmpty({ message: 'La provincia o estado es requerido' })
    provinciaEstado!: string;

    @IsString()
    @IsNotEmpty({ message: 'La ciudad es requerida' })
    ciudad!: string;

    @IsString()
    @IsNotEmpty({ message: 'La profesion es requerida' })
    profesion!: string;

    @IsString()
    @IsNotEmpty({ message: 'La isntitucion es requerida' })
    institucion!: string;
}

// DTO de respuesta para exponer solo los campos deseados
export class DatosPersonalesResponseDto {
    idDatosPersonales!: number;
    ciPasaporte!: string;
    nombres!: string;
    apellidos!: string;
    numTelefono!: string;
    correo!: string;
    pais!: string;
    provinciaEstado!: string;
    ciudad!: string;
    profesion!: string;
    institucion!: string;
}


import {
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { Decimal } from "@prisma/client/runtime/library";

export class CreateDescuentoDto {
    @IsNotEmpty({ message: "El tipo de descuento es obligatorio" })
    @IsString({ message: "El tipo de descuento debe ser una cadena de texto" })
    tipoDescuento!: string;

    @IsNotEmpty({ message: "El valor de descuento es obligatorio" })
    @Type(() => Decimal)
    valorDescuento!: Decimal;

    @IsNotEmpty({ message: "El porcentaje de descuento es obligatorio" })
    @Type(() => Decimal)
    porcentajeDescuento!: Decimal;

    @IsNotEmpty({ message: "La descripción del descuento es obligatoria" })
    @IsString({ message: "La descripción del descuento debe ser una cadena de texto" })
    descripcionDescuento!: string;
}

export class UpdateDescuentoDto {
    @IsOptional()
    @IsString({ message: "El tipo de descuento debe ser una cadena de texto" })
    tipoDescuento?: string;

    @IsOptional()
    @Type(() => Decimal)
    valorDescuento?: Decimal;

    @IsOptional()
    @Type(() => Decimal)
    porcentajeDescuento?: Decimal;

    @IsOptional()
    @IsString({ message: "La descripción del descuento debe ser una cadena de texto" })
    descripcionDescuento?: string;
}

export class DescuentoResponseDto {
    idDescuento!: number;
    tipoDescuento!: string;
    valorDescuento!: Decimal;
    porcentajeDescuento!: Decimal;
    descripcionDescuento!: string;
}
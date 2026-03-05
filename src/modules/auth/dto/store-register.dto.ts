import {
  IsString,
  IsNumber, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StoreRegisterDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre de la tienda es obligatorio' })
  name: string;

  @IsString({ message: 'La dirección debe ser texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  address: string;


  @Type(() => Number)
  @IsNumber({}, { message: 'La latitud debe ser numérica' })
  @IsNotEmpty({ message: 'La latitud de la tienda es obligatorio' })
  latitude?: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'La longitud debe ser numérica' })
  longitude?: number;
}

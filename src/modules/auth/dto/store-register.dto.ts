import {
  IsString,
  MinLength,
  IsNumber,
} from 'class-validator';

export class StoreRegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(5)
  address: string;

  @IsNumber()
  latitude?: number;

  @IsNumber()
  longitude?: number;
}

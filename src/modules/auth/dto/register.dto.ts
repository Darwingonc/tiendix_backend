import {
  IsEmail,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StoreRegisterDto } from './store-register.dto';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @ValidateNested()
  @Type(() => StoreRegisterDto)
  store: StoreRegisterDto;
}


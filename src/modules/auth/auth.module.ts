import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../database/models/users.model';
import { JwtModule } from '@nestjs/jwt';
import fs from 'fs';
import path from 'path';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule.register({
      privateKey: fs.readFileSync(
        path.join(process.cwd(), 'src/keys/private.pem'),
      ),
      publicKey: fs.readFileSync(
        path.join(process.cwd(), 'src/keys/public.pem'),
      ),
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}


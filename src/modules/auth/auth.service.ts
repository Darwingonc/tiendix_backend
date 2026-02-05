import {
  Injectable, UnauthorizedException, ConflictException,
  InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/models/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { LoginDto } from './dto/login.dto';
import { StoreUser } from '../../database/models/store_users.model';
import { Role } from '../../database/models/roles.model';
import { Store } from '../../database/models/stores.model';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService,
              @InjectModel(User) private readonly userModel: typeof User,) {
  }

  async register(data: { email: string; password: string }) {
    const existingUser = await this.userModel.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.userModel.create({
        email: data.email,
        password: hashedPassword,
      });

      return {
        ok: true,
        message: 'Usuario creado correctamente',
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch {
      throw new InternalServerErrorException(
        'Error del servidor al crear el usuario',
      );
    }
  }

  async login(data: LoginDto) {
    const user = await this.userModel.findOne({
      where: { email: data.email },
      include: [
        {
          model: StoreUser,
          include: [Role, Store],
        },
      ],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // CASO 1: Usuario sin tienda (onboarding)
    if (!user.storeUsers || user.storeUsers.length === 0) {
      return {
        ok: true,
        needs_store: true,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    }

    // CASO 2 y 3: Usuario con tienda (ADMIN o CASHIER)
    const storeUser = user.storeUsers[0];

    const payload = {
      sub: user.id,
      uuid: user.uuid,
      email: user.email,
      store_id: storeUser.store_id,
      role: storeUser.role.code,
    };

    const token = this.jwtService.sign(payload);

    return {
      ok: true,
      needs_store: false,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: storeUser.role.code,
        store_id: storeUser.store_id,
      },
    };
  }
}
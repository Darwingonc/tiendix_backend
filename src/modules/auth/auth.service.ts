import {
  Injectable, UnauthorizedException, ConflictException,
  InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/models/users.model';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { LoginDto } from './dto/login.dto';
import { StoreUser } from '../../database/models/store_users.model';
import { Role } from '../../database/models/roles.model';
import { Store } from '../../database/models/stores.model';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService,
              @InjectModel(User) private readonly userModel: typeof User,
              @InjectModel(Store) private readonly storeModel: typeof Store,
              @InjectModel(Role) private readonly roleModel: typeof Role,
              @InjectModel(StoreUser) private readonly storeUserModel: typeof StoreUser,
              @InjectConnection() private readonly sequelize: Sequelize,
              ) {
  }

  async register(data: RegisterDto) {

    return await this.sequelize.transaction(async (transaction) => {

      const existingUser = await this.userModel.findOne({
        where: { email: data.email },
      });

      // Verificar si el correo ya existe
      if (existingUser) {
        throw new ConflictException('El correo ya está registrado, inicia sesión');
      }

      // Hashear password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Crear usuario
      const user = await this.userModel.create(
        {
          email: data.email,
          password: hashedPassword,
        },
        { transaction },
      );

      // Crear tienda
      const store = await this.storeModel.create(
        {
          name: data.store.name,
          address: data.store.address,
          latitude: data.store.latitude,
          longitude: data.store.longitude,
          status: true,
        },
        { transaction },
      );

      // Obtener rol ADMIN para asiganr con la tienda
      const adminRole = await this.roleModel.findOne({
        where: { code: 'ADMIN' },
        transaction,
      });

      if (!adminRole) {
        throw new InternalServerErrorException(
          'El rol ADMIN no está configurado en el sistema',
        );
      }

      // Crear relación store_users
      await this.storeUserModel.create(
        {
          user_id: user.id,
          store_id: store.id,
          role_id: adminRole.id,
        },
        { transaction },
      );

      // Crear JWT directamente
      const payload = {
        sub: user.id,
        email: user.email,
        store_id: store.id,
        role: 'ADMIN',
      };

      const token = this.jwtService.sign(payload);

      return {
        ok: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: 'ADMIN',
          store_id: store.id,
        },
      };
    });
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
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

// importa TODOS tus modelos
import { User } from './models/users.model';
import { StoreUser } from './models/store_users.model';
import { Role } from './models/roles.model';
import { Store } from './models/stores.model';
// agrega los demás que tengas (products, sales, etc.)

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      StoreUser,
      Role,
      Store,
    ]),
  ],
  exports: [
    SequelizeModule,
  ],
})
export class DatabaseModelsModule {}

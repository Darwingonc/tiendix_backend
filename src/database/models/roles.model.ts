import {
  Column,
  Model,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { StoreUser } from './store_users.model';

@Table({
  tableName: 'roles',
  timestamps: true,
})
export class Role extends Model {

  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({
    allowNull: false,
    unique: true,
  })
  declare code: string;

  @Column({
    allowNull: false,
  })
  declare name: string;

  @HasMany(() => StoreUser)
  storeUsers: StoreUser[];
}


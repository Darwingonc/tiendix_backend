import {
  Column,
  Model,
  Table,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { StoreUser } from './store_users.model';

@Table({
  tableName: 'users',
  paranoid: true,
  timestamps: true,
})
export class User extends Model {

  @Column({
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
  })
  declare uuid: string;

  @Column({
    unique: true,
    allowNull: false,
  })
  declare email: string;

  @Column({
    allowNull: false,
  })
  declare password: string;

  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;

  @HasMany(() => StoreUser)
  storeUsers: StoreUser[];
}

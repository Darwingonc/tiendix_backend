import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './users.model';
import { Store } from './stores.model';
import { Role } from './roles.model';

@Table({
  tableName: 'store_users',
  timestamps: true,
})
export class StoreUser extends Model {

  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column
  declare user_id: number;

  @ForeignKey(() => Store)
  @Column
  declare store_id: number;

  @ForeignKey(() => Role)
  @Column
  declare role_id: number;

  declare createdAt: Date;
  declare updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Store)
  store: Store;

  @BelongsTo(() => Role)
  role: Role;
}

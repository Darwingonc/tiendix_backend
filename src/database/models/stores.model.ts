import { Column, Table, HasMany, Model, DataType } from 'sequelize-typescript';
import { StoreUser } from './store_users.model';

@Table({
  tableName: 'stores',
  paranoid: true,
  timestamps: true,
})
export class Store extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ unique: true })
  declare uuid: string;

  @Column
  declare name: string;

  @Column
  declare address: string;

  @Column(DataType.DECIMAL(10, 7))
  declare latitude: number;

  @Column(DataType.DECIMAL(10, 7))
  declare longitude: number;

  @Column
  declare status: boolean;

  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;

  @HasMany(() => StoreUser)
  storeUsers: StoreUser[];
}

import {
  Column,
  ForeignKey,
  Table,
  DataType,
  Model,
} from 'sequelize-typescript';
import { Store } from './stores.model';
import { User } from './users.model';
import { CashRegister } from './cash_registers.model';

@Table({
  tableName: 'sales',
  timestamps: true,
  paranoid: true,
})
export class Sale extends Model {

  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
  })
  declare uuid: string;

  @ForeignKey(() => Store)
  @Column
  declare store_id: number;

  @ForeignKey(() => User)
  @Column
  declare user_id: number;

  @ForeignKey(() => CashRegister)
  @Column
  declare cash_register_id: number;

  @Column(DataType.DECIMAL(10,2))
  declare total: number;

  @Column
  declare status: string;

  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}


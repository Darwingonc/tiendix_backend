import { Column, ForeignKey, Table, Model, DataType, BelongsTo, HasMany } from 'sequelize-typescript';
import { Store } from './stores.model';
import { User } from './users.model';
import { Sale } from './sales.model';
import { SalePayment } from './sales_payments';

@Table({
  tableName: 'cash_registers',
  timestamps: true,
})
export class CashRegister extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => Store)
  @Column
  declare store_id: number;

  @ForeignKey(() => User)
  @Column
  declare user_id: number;

  @Column(DataType.DECIMAL(10, 2))
  declare opening_amount: number;

  @Column(DataType.DECIMAL(10, 2))
  declare closing_amount: number;

  @Column
  declare opened_at: Date;

  @Column
  declare closed_at: Date;

  @Column
  declare status: string;

  declare createdAt: Date;
  declare updatedAt: Date;

  @BelongsTo(() => Store)
  store: Store;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => Sale)
  sales: Sale[];

  @HasMany(() => SalePayment)
  payment_method_id: Sale[];
}

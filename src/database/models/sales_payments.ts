import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Sale } from './sales.model';
import { PaymentMethod } from './payment_methods';

@Table({
  tableName: 'sale_payments',
  timestamps: false,
})
export class SalePayment extends Model {

  @Column({
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Sale)
  @Column({ allowNull: false })
  declare sale_id: number;

  @ForeignKey(() => PaymentMethod)
  @Column({ allowNull: false })
  declare payment_method_id: number;

  @Column({
    type: DataType.DECIMAL(10,2),
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @BelongsTo(() => Sale)
  sale: Sale;

  @BelongsTo(() => PaymentMethod)
  paymentMethod: PaymentMethod;
}

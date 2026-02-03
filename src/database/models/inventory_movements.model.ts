import { Column, ForeignKey, Table, Model, DataType} from 'sequelize-typescript';
import { StoreProduct } from './store_products.model';

@Table({
  tableName: 'cash_registers',
  timestamps: false,
})
export class InventoryMovement extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => StoreProduct)
  @Column
  declare store_product_id: number;

  @Column
  declare type: string;

  @Column
  declare quantity: number;

  @Column
  declare reference_id: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare created_at: Date;
}

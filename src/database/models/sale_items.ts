import { Column, ForeignKey, Table, Model, BelongsTo, DataType } from 'sequelize-typescript';
import { Sale } from './sales.model';
import { StoreProduct } from './store_products.model';

@Table({
  tableName: 'sale_items',
  timestamps: true,
})
export class SaleItem extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true
  })
  declare id: number;

  @ForeignKey(() => Sale)
  @Column
  declare sale_id: number;

  @ForeignKey(() => StoreProduct)
  @Column
  declare store_product_id: number;

  @Column
  declare quantity: number;

  @Column(DataType.DECIMAL(10, 2))
  declare price: number;

  @Column(DataType.DECIMAL(10, 2))
  declare subtotal: number;

  declare createdAt: Date;
  declare updatedAt: Date;

  @BelongsTo(() => Sale)
  sale: Sale;

  @BelongsTo(() => StoreProduct)
  storeProduct: StoreProduct;
}

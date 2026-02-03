import {
  Column,
  ForeignKey,
  Table,
  BelongsTo,
  DataType,
  Model,
} from 'sequelize-typescript';
import { Store } from './stores.model';
import { Product } from './products.model';

@Table({
  tableName: 'store_products',
  paranoid: true,
  timestamps: true,
})
export class StoreProduct extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => Store)
  @Column
  declare store_id: number;

  @ForeignKey(() => Product)
  @Column
  declare product_id: number;

  @Column(DataType.DECIMAL(10, 2))
  declare price: number;

  @Column
  declare stock: number;

  @Column
  declare min_stock: number;

  @Column
  declare status: boolean;

  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;

  @BelongsTo(() => Store)
  store: Store;

  @BelongsTo(() => Product)
  product: Product;
}

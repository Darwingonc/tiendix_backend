import { Column, Table, HasMany, Model, DataType } from 'sequelize-typescript';
import { StoreProduct } from './store_products.model';

@Table({
  tableName: 'products',
  timestamps: true,
  paranoid: true
})
export class Product extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ unique: true })
  declare uuid: string;

  @Column
  declare name: string;

  @Column({ unique: true })
  declare barcode: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column
  declare status: boolean;

  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;

  @HasMany(() => StoreProduct)
  storeProducts: StoreProduct[];
}

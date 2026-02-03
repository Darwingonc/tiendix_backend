import { Column, Table, Model } from 'sequelize-typescript';
@Table({
  tableName: 'payment_methods',
})
export class PaymentMethod extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true
  })
  declare id: number;

  @Column({ unique: true })
  declare code: string;

  @Column
  declare name: string;

}

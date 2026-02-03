import { Global, Module } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { database } from './database';

@Global()
@Module({
  providers: [
    {
      provide: Sequelize,
      useValue: database,
    },
  ],
  exports: [Sequelize],
})
export class DatabaseModule {}

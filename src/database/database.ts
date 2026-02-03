import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
dotenv.config(); // Carga variables de .env

import { ErrorHandler } from '../utils/error-handler'; // Tu manejador de errores si lo tienes

export class Database {
  private sequelize: Sequelize;

  constructor() {
    this.validateEnv();
    this.sequelize = this.initSequelize();
  }

  /** Validar variables de entorno necesarias */
  private validateEnv() {
    const requiredEnv = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_PORT'];
    for (const key of requiredEnv) {
      if (!process.env[key]) {
        throw new Error(`Falta la variable de entorno: ${key}`);
      }
    }
  }

  /** Inicializa Sequelize */
  private initSequelize(): Sequelize {
    try {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        models: [__dirname + '/../modules/**/*.model.ts'], // O donde tengas tus modelos
        logging: console.log,
        define: {
          timestamps: true,
          underscored: true,
        },
      });

      return sequelize;
    } catch (error: unknown) {
      // Type narrowing
      let message = 'Error desconocido';
      if (error instanceof Error) {
        message = error.message;
      }

      ErrorHandler.handleCritical(error, 'Sequelize Initialization Error');
      throw new Error(message);
    }
  }

  /** Autentica la conexión */
  public async authenticate(): Promise<{ ok: boolean; message: string }> {
    try {
      await this.sequelize.authenticate();
      return { ok: true, message: `Conexión exitosa a la DB '${process.env.DB_NAME}'` };
    } catch (error: unknown) {
      let message = 'Error desconocido';
      if (error instanceof Error) {
        message = error.message;
      }

      ErrorHandler.handleCritical(error, 'Database Authentication Error');
      return { ok: false, message: `No fue posible conectar: ${message}` };
    }
  }

  /** Retorna la instancia de Sequelize para usarla en providers o modelos */
  public getInstance(): Sequelize {
    return this.sequelize;
  }
}

// Exportar la instancia global
export const database = new Database().getInstance();

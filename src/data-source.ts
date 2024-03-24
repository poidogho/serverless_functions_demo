import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { User } from './entities/User';
import { Post } from './entities/Post';

config();

const mainConfig: DataSourceOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: false,
  logging: false,
  entities: [User, Post],
  // We use dirname here to prevent it attempting to load the ts files after compilation in js mode
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
  migrationsRun: false,
  metadataTableName: 'typeorm-migrations',
  subscribers: [],
};

const testConfig: Partial<DataSourceOptions> = {
  database: ':memory:',
  migrationsRun: true,
};

const databaseConfig: Record<string, DataSourceOptions> = {
  test: { ...mainConfig, ...testConfig } as DataSourceOptions,
  development: mainConfig,
  production: {
    ...mainConfig,
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
};

const environment = process.env.NODE_ENV ?? 'development';
export const AppDataSource = new DataSource(databaseConfig[environment]);

let dataSource: DataSource | null = null;

/**
 * Since DataSource's are meant to be only initialized once but our lambdas are called many times, we need to make sure
 * we don't call initialize multiple times
 */
export async function getDataSource(): Promise<DataSource> {
  if (dataSource) {
    return dataSource;
  }

  dataSource = await AppDataSource.initialize();

  return dataSource;
}

/**
 * Closes the data source if it has been initialized
 */
export async function closeDataSource(): Promise<void> {
  if (dataSource) {
    await dataSource.destroy();

    dataSource = null;
  }
}

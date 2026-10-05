import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Pool } from 'pg';
import { createDatabase, DATABASE } from './database';

const POOL = Symbol('POOL');

@Global()
@Module({
  providers: [
    {
      provide: POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createDatabase(config.getOrThrow('DATABASE_URL')),
    },
    {
      provide: DATABASE,
      inject: [POOL],
      useFactory: ({ db }: ReturnType<typeof createDatabase>) => db,
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  @Inject(POOL)
  private readonly connection: { pool: Pool };

  async onApplicationShutdown() {
    await this.connection.pool.end();
  }
}

import { Pool } from 'pg';
import { runMigrations } from './runMigrations';

declare global {
  var pgPool: Pool | undefined;
  var migrationsRan: boolean | undefined;
}

console.log('Creating PostgreSQL connection pool with config:', {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

export const pool =
  global.pgPool ??
  new Pool({
    user: String(process.env.POSTGRES_USER),
    password: String(process.env.POSTGRES_PASSWORD),
    database: String(process.env.POSTGRES_DB),
    host: String(process.env.POSTGRES_HOST),
    port: Number(process.env.POSTGRES_PORT),
  });

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

// ⭐ run migrations once per server start
async function init() {
  if (!global.migrationsRan) {
    await runMigrations();
    global.migrationsRan = true;
  }
}

// fire and forget
console.log('Initializing database and running migrations if needed...');
init().catch(console.error);

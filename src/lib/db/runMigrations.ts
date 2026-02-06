import { pool } from './postgres';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  // create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      run_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(process.cwd(), 'src/lib/db/migrations');

  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    const id = file;

    const alreadyRun = await pool.query(
      'SELECT 1 FROM migrations WHERE id = $1',
      [id],
    );

    if (alreadyRun.rowCount) continue;

    console.log('Running migration:', id);

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO migrations(id) VALUES($1)', [id]);
      await pool.query('COMMIT');
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  }

  console.log('Migrations complete');
}

import fs from 'fs/promises';
import path from 'path';
import pool from '../src/config/database.js';

async function runMigrations() {
  const migrationsDir = path.resolve('./migrations');
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (sqlFiles.length === 0) {
    console.log('No migration files found.');
    return;
  }

  const client = await pool.connect();

  try {
    console.log(`Running ${sqlFiles.length} migrations...`);
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      console.log(`Applying ${file}...`);
      await client.query(sql);
    }
    console.log('✅ All migrations applied successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();

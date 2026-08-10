import fs from 'fs/promises';
import path from 'path';
import process from 'process';

const migrationsDir = path.resolve('./migrations');

function formatMigrationName(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

async function createMigration() {
  const [title] = process.argv.slice(2);

  if (!title) {
    console.error('Usage: npm run migrate:create "Add new table"');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const fileName = `${timestamp}_${formatMigrationName(title)}.sql`;
  const filePath = path.join(migrationsDir, fileName);
  const template = `-- Migration: ${title}\n-- Created at ${new Date().toISOString()}\n\nBEGIN;\n\n-- Write your SQL here\n\nCOMMIT;\n`;

  await fs.mkdir(migrationsDir, { recursive: true });
  await fs.writeFile(filePath, template, { flag: 'wx' });

  console.log(`Created migration file: ${filePath}`);
}

createMigration().catch((error) => {
  console.error('Failed to create migration:', error);
  process.exit(1);
});
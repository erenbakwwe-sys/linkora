import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';

const { Pool } = pg;

export async function runMigrations(pool?: pg.Pool) {
  const p = pool || new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://linkora_user:linkora_password@localhost:5432/linkora_db',
  });

  const sqlCandidates = [
    path.resolve(__dirname, '../../../infra/postgres/init.sql'),
    path.resolve(__dirname, '../../infra/postgres/init.sql'),
    path.resolve(process.cwd(), 'infra/postgres/init.sql'),
    path.resolve(process.cwd(), '../../infra/postgres/init.sql'),
  ];
  const sqlPath = sqlCandidates.find((p) => fs.existsSync(p)) || sqlCandidates[0];
  const schemaPath = path.resolve(__dirname, '../migrations/0000_full_schema.sql');

  const client = await p.connect();
  try {
    console.log('Running migrations...');
    if (fs.existsSync(sqlPath)) {
      const initSql = fs.readFileSync(sqlPath, 'utf8');
      await client.query(initSql);
    }
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
    }
    console.log('Migrations completed successfully.');
  } finally {
    client.release();
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  runMigrations().catch(console.error);
}

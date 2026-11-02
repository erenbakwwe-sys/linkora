import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { INIT_SQL, FULL_SCHEMA_SQL } from './schema-sql.js';

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
    const initSql = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, 'utf8') : INIT_SQL;
    await client.query(initSql);

    const schemaSql = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : FULL_SCHEMA_SQL;
    await client.query(schemaSql);

    console.log('Migrations completed successfully.');
  } finally {
    client.release();
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  runMigrations().catch(console.error);
}

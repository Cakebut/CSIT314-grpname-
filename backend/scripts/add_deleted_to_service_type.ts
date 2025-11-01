import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://crashout_user:crashout_password@localhost:5433/crashout_db";

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log('Connecting to DB...');
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE service_type
      ADD COLUMN IF NOT EXISTS deleted boolean NOT NULL DEFAULT false;
    `);
    await client.query('COMMIT');
    console.log('Migration complete: service_type.deleted added (default false)');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();


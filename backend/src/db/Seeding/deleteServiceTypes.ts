import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { service_typeTable } from '../schema/aiodb';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);

async function deleteServiceTypes() {
  try {
    await db.delete(service_typeTable);
    console.log('✅ All service types deleted!');
  } catch (err) {
    console.error('❌ Error deleting service types:', err);
  } finally {
    await pool.end();
  }
}

deleteServiceTypes()
  .catch((err) => {
    console.error(err);
    pool.end();
  });

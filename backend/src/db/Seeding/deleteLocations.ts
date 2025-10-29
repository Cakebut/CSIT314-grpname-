
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { locationTable } from '../schema/aiodb';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);

export async function deleteLocations() {
  await db.delete(locationTable);
  console.log('Deleted all locations');
  await pool.end();
}

if (require.main === module) {
  deleteLocations().then(() => process.exit(0));
}

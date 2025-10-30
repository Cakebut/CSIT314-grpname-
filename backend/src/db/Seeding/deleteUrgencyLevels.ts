
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { urgency_levelTable } from '../schema/aiodb';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);

export async function deleteUrgencyLevels() {
  await db.delete(urgency_levelTable);
  console.log('Deleted all urgency levels');
  await pool.end();
}

if (require.main === module) {
  deleteUrgencyLevels().then(() => process.exit(0));
}

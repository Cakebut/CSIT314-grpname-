import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { useraccountTable } from '../schema/aiodb';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function deleteAllUsers() {
  await db.delete(useraccountTable);
  console.log('🗑️ All users deleted!');
}

deleteAllUsers()
  .then(() => pool.end())
  .catch((err) => {
    console.error('❌ Error deleting users:', err);
    pool.end();
  });

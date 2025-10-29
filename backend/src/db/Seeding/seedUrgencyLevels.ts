
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { urgency_levelTable } from '../schema/aiodb';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);


const levels = [
  { label: 'Low Priority' },
  { label: 'High Priority' },
];

async function seedUrgencyLevels() {
  try {
    const existing = await db.select().from(urgency_levelTable).limit(1);
    if ((existing as any[]).length === 0) {
      await db.insert(urgency_levelTable).values(levels);
      console.log(`✅ Inserted ${levels.length} urgency levels successfully!`);
    } else {
      console.log('ℹ️ Urgency levels already exist, skipping seeding.');
    }
  } catch (err) {
    console.error('❌ Error seeding urgency levels:', err);
  } finally {
    await pool.end();
  }
}

seedUrgencyLevels()
  .catch((err) => {
    console.error(err);
    pool.end();
  });

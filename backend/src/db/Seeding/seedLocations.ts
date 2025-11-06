
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { locationTable } from '../schema/aiodb';
import dotenv from 'dotenv';
dotenv.config();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);


const locations = [
  { name: 'North' },
  { name: 'South' },
  { name: 'East' },
  { name: 'West' },
];

async function seedLocations() {
  try {
    const existing = await db.select().from(locationTable).limit(1);
    if ((existing as any[]).length === 0) {
      await db.insert(locationTable).values(locations);
      console.log(`✅ Inserted ${locations.length} locations successfully!`);
    } else {
      console.log('ℹ️ Locations already exist, skipping seeding.');
    }
  } catch (err) {
    console.error('❌ Error seeding locations:', err);
  } finally {
    await pool.end();
  }
}

seedLocations()
  .catch((err) => {
    console.error(err);
    pool.end();
  });
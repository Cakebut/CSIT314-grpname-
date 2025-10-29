import { faker } from '@faker-js/faker'
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { service_typeTable } from '../schema/aiodb';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);

const serviceTypes = [
  { id: 1, name: "Medical Assistance" },
  { id: 2, name: "Mobility & Accessibility" },
  { id: 3, name: "Daily Living Support" },
  { id: 4, name: "Companionship" },
  { id: 5, name: "Administrative & Financial" },
];

async function seedServiceTypes() {
  try {
    const existing = await db.select().from(service_typeTable).limit(1);
    if ((existing as any[]).length === 0) {
      await db.insert(service_typeTable).values(serviceTypes);
      console.log(`✅ Inserted ${serviceTypes.length} service types successfully!`);
    } else {
      console.log('ℹ️ Service types already exist, skipping seeding.');
    }
  } catch (err) {
    console.error('❌ Error seeding service types:', err);
  } finally {
    await pool.end();
  }
}

seedServiceTypes()
  .catch((err) => {
    console.error(err);
    pool.end();
  });
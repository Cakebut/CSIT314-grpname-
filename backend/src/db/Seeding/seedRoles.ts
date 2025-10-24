// ...existing code...
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import { roleTable } from '../schema/aiodb'
dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})
const db = drizzle(pool)

const roles = [
  { label: 'User Admin', issuspended: false },
  { label: 'Person In Need', issuspended: false },
  { label: 'CSR Rep', issuspended: false },
  { label: 'Platform Manager', issuspended: false },
]

async function seedRoles() {
  // avoid duplicate inserts if run multiple times
  try {
    // insert only when roles table is empty
    const existing = await db.select().from(roleTable).limit(1)
    if ((existing as any[]).length === 0) {
      await db.insert(roleTable).values(roles)
      console.log(`✅ Inserted ${roles.length} roles successfully!`)
    } else {
      console.log('ℹ️ Roles already exist, skipping seeding.')
    }
  } catch (err) {
    console.error('❌ Error seeding roles:', err)
  } finally {
    await pool.end()
  }
}

seedRoles()
  .catch((err) => {
    console.error(err)
    pool.end()
  })
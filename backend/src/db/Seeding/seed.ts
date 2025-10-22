
import { faker } from '@faker-js/faker'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { useraccountTable } from '../schema/aiodb' // adjust path to your schema
import dotenv from 'dotenv'
dotenv.config()

// 1. Setup PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// 2. Connect Drizzle ORM
const db = drizzle(pool)


//SEEEDING USERS
async function seedUsers(count: number) {
  const fakeUsers = []

  for (let i = 0; i < count; i++) {
    fakeUsers.push({
      username: faker.internet.username(),
  password: faker.internet.password({ length: 12 }),
      roleid: faker.number.int({ min: 1, max: 4 }), // depends on your roleTable
      issuspended: faker.datatype.boolean(),
    })
  }

  // Insert all fake users into DB
  await db.insert(useraccountTable).values(fakeUsers)

  console.log(`✅ Inserted ${count} fake users successfully!`)
}

seedUsers(20) // change the number to how many users you want
  .then(() => pool.end())
  .catch((err) => {
    console.error('❌ Error seeding users:', err)
    pool.end()
  })

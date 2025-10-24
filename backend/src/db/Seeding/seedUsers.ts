
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


const customUsers = [
  { username: "admin", password: "password", roleid: 1, issuspended: false },
  { username: "pin", password: "password", roleid: 2, issuspended: false },
  { username: "csr", password: "password", roleid: 3, issuspended: false },
  { username: "pm", password: "password", roleid: 4, issuspended: false },
  // Add more users as needed
];


async function seedCustomUsers() {
  await db.insert(useraccountTable).values(customUsers);
  console.log(`✅ Inserted ${customUsers.length} CUSTOM users successfully!`);
}


//SEEEDING USERS
async function seedUsers(count: number) {
  const fakeUsers = []

  for (let i = 0; i < count; i++) {
    fakeUsers.push({
      username: faker.internet.username(),
  password: "password" ,//faker.internet.password({ length: 12 }),
      roleid: faker.number.int({ min: 1, max: 4 }), // depends on your roleTable
      issuspended: faker.datatype.boolean(),
    })
  }

  // Insert all fake users into DB
  await db.insert(useraccountTable).values(fakeUsers)

  console.log(`✅ Inserted ${count} fake users successfully!`)
}
seedCustomUsers()
seedUsers(20) // change the number to how many users you want
  .then(() => pool.end())
  .catch((err) => {
    console.error('❌ Error seeding users:', err)
    pool.end()
  })

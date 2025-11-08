 
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import {
  service_typeTable,
  locationTable,
  urgency_levelTable,
  useraccountTable,
  csr_requestsTable,
  pin_requestsTable,
  csr_shortlistTable,
  csr_interestedTable,
  roleTable,
} from "../schema/aiodb";
import dotenv from "dotenv";
dotenv.config();



// Allow skipping seeding via environment variable
const SKIP_SEEDING = process.env.SKIP_SEEDING === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

// Set this variable to control how many fake users, pin requests, and csr requests to create
const NUM_FAKE_USERS = 20;
const NUM_FAKE_PIN_REQUESTS = 10;
const NUM_FAKE_CSR_REQUESTS = 10;

// Custom user info
const customUsers = [
  { username: "admin", password: "password", roleid: 1, issuspended: false },
  { username: "pin", password: "password", roleid: 2, issuspended: false },
  { username: "csr", password: "password", roleid: 3, issuspended: false },
  { username: "pm", password: "password", roleid: 4, issuspended: false },
  { username: "suspended_user", password: "password", roleid: 1, issuspended: true },
  { username: "Alex", password: "password", roleid: 1, issuspended: false },
  
];



const roles = [
  { label: 'User Admin', issuspended: false },
  { label: 'Person In Need', issuspended: false },
  { label: 'CSR Rep', issuspended: false },
  { label: 'Platform Manager', issuspended: false },
]

async function seedRoles() {
  // avoid duplicate inserts if run multiple times
  if (SKIP_SEEDING) {
    console.log('⚠️ SKIP_SEEDING is true, skipping role seeding.');
    return;
  }
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
  }
}
// Generate scalable fake users
function generateFakeUsers(count: number) {
  const roles = [1, 2, 3, 4];
  return Array.from({ length: count }, (_, i) => ({
    username: faker.internet.username() + i,
    password: "password",
    roleid: faker.helpers.arrayElement(roles),
    issuspended: faker.datatype.boolean(),
  }));
}

function fakeInt(min: number, max: number) {
  return faker.number.int({ min, max });
}

async function seedData() {
  if (SKIP_SEEDING) {
    console.log('⚠️ SKIP_SEEDING is true, skipping all data seeding.');
    return;
  }
  try {
    // Seed Service Types
    await db.insert(service_typeTable).values([
      { name: "Medical", deleted: false },
      { name: "Transport", deleted: false },
      { name: "Household Assistance", deleted: false },
    ]);
    console.log("✅ Seeded service types");

    // Seed Locations
    await db
      .insert(locationTable)
      .values([
        { name: "North" },
        { name: "South" },
        { name: "East" },
        { name: "West" },
      ]);
    console.log("✅ Seeded locations");

    // Seed Urgency Levels
    await db
      .insert(urgency_levelTable)
      .values([{ label: "Low Priority" }, { label: "High Priority" }]);
    console.log("✅ Seeded urgency levels");

    // Seed Users (custom + fake)
    const fakeUsers = generateFakeUsers(NUM_FAKE_USERS);
    await db.insert(useraccountTable).values([...customUsers, ...fakeUsers]);
    console.log("✅ Seeded user accounts (custom + fake)");

    // Fetch all user IDs for dynamic assignment
    const users = await db.select().from(useraccountTable);
    const csrUsers = users.filter((u) => u.roleid === 3);
    const pinUsers = users.filter((u) => u.roleid === 2);
    const csrIds = csrUsers.map((u) => u.id);
    const pinIds = pinUsers.map((u) => u.id);

    // Fetch all location IDs for dynamic assignment
    const locations = await db.select().from(locationTable);
    const locationIds = locations.map((l) => l.id);

    // Fetch all urgency level IDs for dynamic assignment
    const urgencies = await db.select().from(urgency_levelTable);
    const urgencyIds = urgencies.map((u) => u.id);

    // Fetch all service type IDs for dynamic assignment
    const serviceTypes = await db.select().from(service_typeTable);
    const serviceTypeIds = serviceTypes.map((s) => s.id);

    // Example: Seed PIN requests
    for (let i = 0; i < NUM_FAKE_PIN_REQUESTS; i++) {
      await db.insert(pin_requestsTable).values({
        pin_id: faker.helpers.arrayElement(pinIds),
        csr_id: null,
        title: faker.lorem.words(3),
        categoryID: faker.helpers.arrayElement(serviceTypeIds),
        requestType: faker.helpers.arrayElement([
          "Medical",
          "Transport",
          "Household Assistance",
        ]),
        message: faker.lorem.sentence(),
        locationID: faker.helpers.arrayElement(locationIds),
        urgencyLevelID: faker.helpers.arrayElement(urgencyIds),
        createdAt: faker.date.recent({ days: 30 }),
        status: "Available",
        view_count: fakeInt(0, 100),
        shortlist_count: fakeInt(0, 10),
      });
    }
    console.log("✅ Seeded PIN requests");

    // Example: Seed CSR requests
    // for (let i = 0; i < NUM_FAKE_CSR_REQUESTS; i++) {
    //   await db.insert(csr_requestsTable).values({
    //     pin_id: faker.helpers.arrayElement(pinIds),
    //     csr_id: faker.helpers.arrayElement(csrIds),
    //     categoryID: faker.helpers.arrayElement(serviceTypeIds),
    //     message: faker.lorem.sentence(),
    //     requestedAt: faker.date.recent({ days: 30 }),
    //     status: faker.helpers.arrayElement([
    //       "Pending",
    //       "Completed",
    //       "Cancelled",
    //     ]),
    //   });
    // }
    // console.log("✅ Seeded CSR requests");

    // Fetch all pin request IDs for dynamic assignment
    const pinRequests = await db.select().from(pin_requestsTable);
    const pinRequestIds = pinRequests.map((p) => p.id);

    // Example: Seed CSR shortlist (avoid duplicate pairs)
    const usedShortlistPairs = new Set();
    for (
      let i = 0;
      i < Math.min(NUM_FAKE_CSR_REQUESTS, pinRequestIds.length, csrIds.length);
      i++
    ) {
      let csr_id,
        pin_request_id,
        pair,
        attempts = 0;
      do {
        csr_id = faker.helpers.arrayElement(csrIds);
        pin_request_id = faker.helpers.arrayElement(pinRequestIds);
        pair = `${csr_id},${pin_request_id}`;
        attempts++;
      } while (usedShortlistPairs.has(pair) && attempts < 10);
      if (usedShortlistPairs.has(pair)) continue;
      usedShortlistPairs.add(pair);
      // await db.insert(csr_shortlistTable).values({
      //   csr_id,
      //   pin_request_id,
      //   shortlistedAt: faker.date.recent({ days: 30 }),
      // });
    }
    console.log("✅ Seeded CSR shortlist");
    

    console.log("✅ All data seeded!");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  } finally {
    await pool.end();
  }
}
seedRoles();
seedData();


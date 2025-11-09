 
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
  notificationTable,
  feedbackTable,
  roleTable,
} from "../schema/aiodb";
import dotenv from "dotenv";
import { eq, and, sql, not } from "drizzle-orm";
dotenv.config();



// Allow skipping seeding via environment variable
const SKIP_SEEDING = process.env.SKIP_SEEDING === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

// Set this variable to control how many fake users, pin requests, and csr requests to create
// Defaults are large enough for a demo load (can be overridden via env vars)
const NUM_FAKE_USERS = Number(process.env.NUM_FAKE_USERS ?? 100);
const NUM_FAKE_PIN_REQUESTS = Number(process.env.NUM_FAKE_PIN_REQUESTS ?? 100);
const NUM_FAKE_CSR_REQUESTS = Number(process.env.NUM_FAKE_CSR_REQUESTS ?? 100);

// Custom user info
const customUsers = [
  { username: "admin", password: "password", roleid: 1, issuspended: false },
  { username: "pin", password: "password", roleid: 2, issuspended: false },
  { username: "csr", password: "password", roleid: 3, issuspended: false },
  { username: "pm", password: "password", roleid: 4, issuspended: false },
  { username: "suspended_user", password: "password", roleid: 1, issuspended: true }
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

    // Seed Users (custom + fake) - idempotent: only insert usernames that do not already exist
    const fakeUsers = generateFakeUsers(NUM_FAKE_USERS);
    // Fetch existing usernames to avoid unique constraint violations
    const existingUsers = await db.select({ username: useraccountTable.username }).from(useraccountTable);
    const existingUsernames = new Set(existingUsers.map((u: any) => String(u.username)));
    const usersToInsert = [...customUsers, ...fakeUsers].filter((u) => !existingUsernames.has(u.username));
    if (usersToInsert.length) {
      await db.insert(useraccountTable).values(usersToInsert);
      console.log(`✅ Seeded user accounts (${usersToInsert.length} new)`);
    } else {
      console.log('ℹ️ No new user accounts to seed (users already exist)');
    }

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

    // CSR requests will be seeded after pin request IDs are available (below)

    // Fetch all pin request IDs for dynamic assignment
    const pinRequests = await db.select().from(pin_requestsTable);
    const pinRequestIds = pinRequests.map((p) => p.id);

    // Seed CSR interactions per PIN request according to dynamic flow rules.
    // Rules implemented:
    // - A PIN request may be 'Available', 'Pending' (assigned to one CSR), or 'Completed' (one CSR completed)
    // - Many CSRs can be interested in a PIN request. For each interested CSR we create csr_interested + csr_requests (Pending)
    // - If a PIN request is Pending, one CSR is assigned: their csr_request row becomes 'Accepted', other csr_request rows for that PIN become 'Rejected', and csr_interested rows for that PIN are removed (accepted flow removes interested rows)
    // - If a PIN request is Completed, one CSR is assigned and their csr_request is 'Completed' and optional feedback may be created
    const MAX_INTEREST_PER_REQUEST = 6;
    const FEEDBACK_PROB = Number(process.env.SEED_FEEDBACK_PROB ?? 0.6);

    for (const pr of pinRequests) {
      // Decide PIN request lifecycle state (weighted)
      const r = Math.random();
      let pinState: 'Available' | 'Pending' | 'Completed' = 'Available';
      if (r < 0.2) pinState = 'Completed';
      else if (r < 0.5) pinState = 'Pending';

      // Update pin_requests status accordingly
      await db.update(pin_requestsTable).set({ status: pinState }).where(eq(pin_requestsTable.id, pr.id));

      // Timestamp used for interested rows created here
      const interestedAt = faker.date.recent({ days: 30 });

      if (pinState === 'Available') {
        // Multiple CSRs can express interest
        const numInterested = faker.number.int({ min: 0, max: Math.min(MAX_INTEREST_PER_REQUEST, csrIds.length) });
        const interestedCsrs = new Set<number>();
        while (interestedCsrs.size < numInterested) {
          interestedCsrs.add(faker.helpers.arrayElement(csrIds));
        }

        // Insert csr_interested rows for each interested CSR and aligned csr_requests
        for (const csr_id of Array.from(interestedCsrs)) {
          try {
            await db.insert(csr_interestedTable).values({ csr_id, pin_request_id: pr.id, interestedAt });
          } catch (e) {}
          try {
            await db.insert(csr_requestsTable).values({
              pin_request_id: pr.id,
              csr_id,
              message: faker.lorem.sentence(),
              requestedAt: faker.date.recent({ days: 30 }),
              interestedAt: interestedAt,
              status: 'Pending',
            });
          } catch (e) {}
        }
      } else if ((pinState === 'Pending' || pinState === 'Completed') && csrIds.length > 0) {
        // For Pending/Completed: create exactly one interested CSR and aligned csr_request, then assign them
        const assignedCsr = faker.helpers.arrayElement(csrIds);

        // Insert single csr_interested row for the assigned CSR
        try {
          await db.insert(csr_interestedTable).values({ csr_id: assignedCsr, pin_request_id: pr.id, interestedAt });
        } catch (e) {}

        // Insert aligned csr_requests row for the assigned CSR
        try {
          await db.insert(csr_requestsTable).values({
            pin_request_id: pr.id,
            csr_id: assignedCsr,
            message: faker.lorem.sentence(),
            requestedAt: faker.date.recent({ days: 30 }),
            interestedAt: interestedAt,
            status: pinState === 'Pending' ? 'Accepted' : 'Completed',
          });
        } catch (e) {}

        // Assign CSR on pin_requests
        await db.update(pin_requestsTable).set({ csr_id: assignedCsr }).where(eq(pin_requestsTable.id, pr.id));

        // Optionally create feedback for Completed
        if (pinState === 'Completed' && Math.random() < FEEDBACK_PROB) {
          try {
            await db.insert(feedbackTable).values({
              pin_id: pr.pin_id,
              csr_id: assignedCsr,
              requestId: pr.id,
              rating: faker.number.int({ min: 3, max: 5 }),
              description: faker.lorem.sentences(2),
              createdAt: faker.date.recent({ days: 10 }),
            });
          } catch (e) {}
        }
      }
    }
    console.log("✅ Seeded CSR requests and related interested/feedback data");

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
    

    // --- Additional: Seed notifications to create realistic user-visible events ---
    const NUM_NOTIFICATIONS = Number(process.env.NUM_NOTIFICATIONS ?? 100);
    const notificationTypes = ['interested', 'shortlist', 'accepted', 'rejected', 'feedback'];
    for (let i = 0; i < NUM_NOTIFICATIONS; i++) {
      try {
        const pin = faker.helpers.arrayElement(pinRequests);
        const csr = faker.helpers.arrayElement(csrIds);
        await db.insert(notificationTable).values({
          pin_id: pin.pin_id,
          csr_id: csr,
          pin_request_id: pin.id,
          type: faker.helpers.arrayElement(notificationTypes),
          createdAt: faker.date.recent({ days: 30 }),
          read: faker.datatype.boolean() ? 1 : 0,
        });
      } catch (e) {
        // ignore unique/constraint errors
      }
    }

    console.log("✅ Seeded notifications and all data seeded!");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  } finally {
    await pool.end();
  }
}
seedRoles();
seedData();


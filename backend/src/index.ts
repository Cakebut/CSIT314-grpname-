import session from 'express-session'
import express from 'express'
import cors from 'cors' 

// Drizzle ORM
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import connectPgSimple from 'connect-pg-simple';
import { sql } from 'drizzle-orm';

//Routers
import { router } from './router/userAdmin';
import { createPlatformRouter } from './router/platformManager';

declare module 'express-session' {
  interface SessionData {
    username?: string;
  }
}

export const app = express();
const port = 3000;
export const DATABASE_URL =
  "postgresql://crashout_user:crashout_password@localhost:5433/crashout_db";

// Initialize pg pool and pass to drizzle (required)
const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool);

app.use(express.json())
app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true
    })
)
app.use(
  session({
    store: new (connectPgSimple(session))({
      createTableIfMissing: true,
      conString: DATABASE_URL
    }),
    secret: "(@*#Y&URN(*WY#UN(YN(W#(#R*TVUYMN(*",
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    // Insert express-session options here
  })
);

app.get("/", async (req, res) => {
  try {
    const result = await db.execute(sql`SELECT 1`);
    console.log('Connection successful:', result);
  } catch (err) {
    console.log(err);
    console.log("Failed to make connection to the DB")
  }
  res.send("Hello World!");
});



app.use("/api/", router)
app.use("/api/", createPlatformRouter(db))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

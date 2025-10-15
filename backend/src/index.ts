import { drizzle } from 'drizzle-orm/node-postgres';
import session from 'express-session'
import { sql } from 'drizzle-orm';
import express from 'express'
 
import cors from 'cors'
import connectPgSimple from 'connect-pg-simple';
import { userAdminRouter } from './api/userAdmin';

declare module 'express-session' {
  interface SessionData {
    username?: string;
  }
}

export const app = express();
const port = 3000;
export const DATABASE_URL =
  "postgresql://crashout_user:crashout_password@localhost:5433/crashout_db";

export const db = drizzle(DATABASE_URL);

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

// userAdminRouter.post("/api/person-in-need", async (req, res) => {
//     // Check if logged-in user is User Admin
//     if (!req.session.username) {
//         return res.status(401).json({ error: "Not logged in" });
//     }
//     const adminUser = await db.select().from(personInNeedTable)
//         .where(sql`LOWER(${personInNeedTable.username}) = LOWER(${req.session.username}) AND ${personInNeedTable.role} = 'User Admin'`)
//         .limit(1);
//     if (adminUser.length === 0) {
//         return res.status(403).json({ error: "Only User Admin can create accounts" });
//     }

//     const { username, password, role } = req.body;
//     try {
//         await db.insert(personInNeedTable).values({
//             username,
//             password,
//             role,
//         });
//         return res.status(201).json({ message: "Account created" });
//     } catch (err) {
//         console.error("Error: ", err);
//         return res.status(500).json({ error: "Account creation failed" });
//     }
// });

app.use("/", userAdminRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

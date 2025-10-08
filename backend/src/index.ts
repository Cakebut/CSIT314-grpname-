import { drizzle } from 'drizzle-orm/node-postgres';
import session from 'express-session'
import { sql } from 'drizzle-orm';
import express from 'express'
import { personInNeedTable } from './db/schema/personInNeed';
import cors from 'cors'
import connectPgSimple from 'connect-pg-simple';

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

app.post("/api/person-in-need", async (req, res) => {
    console.log("Request body: ", req.body)

    const usernameToUse = req.body.username
    const passwordToUse = req.body.password

    try {
      await db.insert(personInNeedTable).values({
        username: usernameToUse,
        password: passwordToUse
      }) 
    } catch (err) {
      console.error("Error: ", err)
    }
    res.send(200)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

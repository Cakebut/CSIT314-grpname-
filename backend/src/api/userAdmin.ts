import { Router } from "express";
import { db } from "../index";
import { users,role,service_cateogry,csr_requests } from "../db/schema/aiodb";
import { sql, eq, and } from "drizzle-orm"; // Add this import

export const userAdminRouter = Router();

// Create Account (Register)
// userAdminRouter.post("/api/person-in-need", async (req, res) => {
// const usernameToUse = req.body.username
// const passwordToUse = req.body.password

// try {
// await db.insert(personInNeedTable).values({
// username: usernameToUse,
// password: passwordToUse
// })
// return res.status(201).json({ message: "Account created" })
// }
// catch (err) {
// console.error("Error: ", err)
// return res.status(500).json({ error: "Account creation failed" })
// }
// })

// Login
userAdminRouter.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: "User does not exist" });
    }

    if (user[0].password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    (req.session as any).username = username;
    return res.json({ 
      message: "Logged in" ,
      role: user[0].roleID === 1 ? "User Admin" : user[0].roleID === 2 ? "PIN" : "Unknown" // Assuming roleID 1 is User Admin and 2 is PIN
    });
  } catch (err) {
    console.error("Login error: ", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// Logout
userAdminRouter.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

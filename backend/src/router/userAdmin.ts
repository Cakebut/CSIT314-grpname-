import { Router } from "express";
import { db } from "../index";
import { users,role,service_type,csr_requests } from "../db/schema/aiodb";
import { sql, eq, and } from "drizzle-orm"; // Add this import

export const userAdminRouter = Router();

 

// Login
userAdminRouter.post("/login", async (req, res) => {
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
      role: user[0].roleid === 1 ? "User Admin" : user[0].roleid === 2 ? "PIN" : "Unknown" // Assuming roleID 1 is User Admin and 2 is PIN
    });
  } catch (err) {
    console.error("Login error: ", err);
    return res.status(500).json({ error: "Login failed" });
  }
});



// Logout
userAdminRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

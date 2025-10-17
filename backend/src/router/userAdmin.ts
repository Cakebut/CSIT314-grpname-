import { Router } from "express";
import { db } from "../index";
import { usersTable,roleTable,service_typeTable,csr_requestsTable } from "../db/schema/aiodb";
import { sql, eq, and } from "drizzle-orm"; // Add this import

import {  CreateUserController } from "../controller/sharedControllers";

export const router = Router();

router.post("/users/", async(req, res) => {
  const { username, password, roleid } = req.body



  try { 
    const controller = new CreateUserController()
    const obj = await controller.createUserfuunc1(username, password, roleid)
    res.status(200).json({
      success: obj
    })
  } catch (err) {
    res.status(404)
  }
  res.status(201)
})

// Login
router.post("/userAdmin/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
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



// userAdminRouter.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   const userAccount = new LoginController().login(username, password);
//   const user = await userAccount.login(username, password);

//   if (!user) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   return res.status(200).json({ user });
// });

// Logout
router.post("/userAdmin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});




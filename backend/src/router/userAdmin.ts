import { Router } from "express";
import { db } from "../index";
import { usersTable,roleTable,service_typeTable,csr_requestsTable } from "../db/schema/aiodb";
import { sql, eq, and } from "drizzle-orm"; // Add this import

import {  CreateUserController } from "../controller/sharedControllers";

const router = Router();
const createUserController = new CreateUserController();


router.post("/users/", async(req, res) => {
  const { username, password, roleid } = req.body

  try { 
    const obj = await createUserController.createUserfuunc1(username, password, roleid)
    if (obj) {
      return res.status(201).json({success: obj})
    } else {
      return res.status(500).json({ success: false, error: "Account creation failed" });
    }
  }  
  catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});


router.get('/roles', async (req, res) => {
  try {
    const roles = await db.select().from(roleTable);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

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

// Get the users from database
router.get('/users', async (req, res) => {
  try {
    const users = await createUserController.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
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


export { router };



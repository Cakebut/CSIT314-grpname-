import { Router } from "express";
import { db } from "../index";
import { useraccountTable,roleTable,service_typeTable,csr_requestsTable } from "../db/schema/aiodb";
import { sql, eq, and } from "drizzle-orm"; // Add this import

//Controllers
import {  CreateUserController, LoginController } from "../controller/sharedControllers";
import { ViewUserAccountController } from "../controller/UserAdminControllers";


const router = Router();
const createUserController = new CreateUserController();
const viewUserAccountController = new ViewUserAccountController();




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


 

 

// Get the users from database
router.get('/users', async (req, res) => {
  try {
    const users = await viewUserAccountController.getAllUserAccounts();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
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

//Login
router.post("/userAdmin/login", async(req,res)=>{
  const {username, password} = req.body;
  const userAccRes = await new LoginController().login(username, password);
 
  if(userAccRes){
    (req.session as any).username = username;
    return res.json({ 
      message: "Logged in" ,
      role: userAccRes.userProfile
    });
  } else {
    return  res.status(401).json({ error: "Invalid credentials or account suspended" });
  }
}) 


// Logout
router.post("/userAdmin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});


export { router };



 
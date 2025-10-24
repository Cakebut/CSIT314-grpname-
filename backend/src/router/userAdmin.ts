import { Router } from "express";
import { db } from "../index";
import { useraccountTable,roleTable,service_typeTable,csr_requestsTable } from "../db/schema/aiodb";
import { sql, eq, and } from "drizzle-orm"; // Add this import

//Controllers
import { LoginController  } from "../controller/sharedControllers";
import { ViewUserAccountController, UpdateUserController ,RoleController, CreateUserController, SearchUserController } from "../controller/UserAdminControllers";


//ROUTERS
const router = Router();
const createUserController = new CreateUserController();
const viewUserAccountController = new ViewUserAccountController();
const updateUserController = new UpdateUserController();
const roleController = new RoleController();
const searchUserController = new SearchUserController();

// Update user info
router.post("/users/:id", async (req, res) => {
  const { username, roleid, issuspended } = req.body;
  const id = Number(req.params.id);
  if (!id || !username || !roleid) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }
  try {
    const result = await updateUserController.updateUserInfo(id, username, roleid, issuspended);
    if (result) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: "Update failed" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});


router.post("/users/", async(req, res) => {
  const { username, password, roleid } = req.body
  try { 
    const obj = await createUserController.createUserFunc(username, password, roleid)
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

router.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, error: "Missing user id" });
  }
  try {
    const result = await updateUserController.deleteUserById(id);
    if (result) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

//Login

router.post("/userAdmin/login", async(req,res)=>{
  const {username, password} = req.body;
  const userAccRes = await new LoginController().login(username, password);
  if(userAccRes === 'suspended') {
    return res.status(403).json({ error: "Account is currently suspended" });
  }
  if(userAccRes){
    (req.session as any).username = username;
    return res.json({ 
      message: "Logged in" ,
      role: userAccRes.userProfile
    });
  } else {
    return  res.status(401).json({ error: "Invalid credentials" });
  }
})


// Logout
router.post("/userAdmin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// Create new role
router.post('/roles', async (req, res) => {
  const { label } = req.body;
  if (!label) {
    return res.status(400).json({ success: false, error: 'Role label required' });
  }
  try {
    const result = await roleController.createRole(label);
    if (result) {
      return res.status(201).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: 'Failed to create role' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to create role' });
  }
});

// Delete role
router.delete('/roles/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, error: 'Role id required' });
  }
  try {
    const result = await roleController.deleteRole(id);
    if (result) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to delete role' });
  }
});

// Suspend/Unsuspend role
router.post('/roles/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { issuspended } = req.body;
  if (typeof issuspended !== 'boolean') {
    return res.status(400).json({ success: false, error: 'issuspended boolean required' });
  }
  try {
    const result = await roleController.setRoleSuspended(id, issuspended);
    if (result) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to update role status' });
  }
});

// Search roles by label
router.get('/roles/search', async (req, res) => {
  const keyword = req.query.q as string || '';
  try {
    const roles = await roleController.searchRoles(keyword);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search roles' });
  }
});

// Search and filter users by username, role, and status
router.get('/users/search', async (req, res) => {
  const keyword = req.query.q as string || '';
  const role = req.query.role as string || '';
  const status = req.query.status as string || '';
  try {
    const users = await searchUserController.searchAndFilterUsers({ keyword, role, status });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search users' });
  }
});


export { router };




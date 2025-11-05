import { Router } from "express";
import { Request, Response } from "express";
import { db } from "../db/client";
import { useraccountTable,roleTable } from "../db/schema/aiodb";
import { sql, eq, and } from "drizzle-orm"; // Add this import


//Controllers
import { LoginController  } from "../controller/sharedControllers";
import { ViewUserAccountController, UpdateUserController ,RoleController, CreateUserController, SearchUserController ,ExportUserAccountController} from "../controller/UserAdminControllers";
import { AuditLogController } from "../controller/AuditLogController";
 


//ROUTERS
const router = Router();
const createUserController = new CreateUserController();
const viewUserAccountController = new ViewUserAccountController();
const updateUserController = new UpdateUserController();
const roleController = new RoleController();
const searchUserController = new SearchUserController();
const auditLogController = new AuditLogController();
const exportUserAccountController = new ExportUserAccountController();

 


//Login
router.post("/userAdmin/login", async(req: Request, res: Response)=>{
  const {username, password} = req.body;
  const userAccRes = await new LoginController().login(username, password);
  if(userAccRes === 'suspended') {
    return res.status(403).json({ error: "Account is currently suspended" });
  }
  if(userAccRes){
    (req.session as any).username = username;
    // Log login action via controller
    await auditLogController.createAuditLog(
      username,
      "login",
      username,
      "User logged in."
    );
    return res.json({ 
      message: "Logged in" ,
      role: userAccRes.userProfile,
      id: userAccRes.id,
      username: userAccRes.username
    });
  } else {
    return  res.status(401).json({ error: "Invalid credentials" });
  }
})


// Logout
router.post("/userAdmin/logout", (req, res) => {
  const actor = req.session?.username || "unknown";
  req.session.destroy(async () => {
    // Log logout action via controller
    await auditLogController.createAuditLog(
      actor,
      "logout",
      actor,
      "User logged out."
    );
    res.json({ message: "Logged out" });
  });
});


//USER MANAGEMENT

// Update user info
router.post("/users/:id", async (req: Request, res: Response) => {
  const { username, roleid, issuspended } = req.body;
  const id = Number(req.params.id);
  if (!id || !username || !roleid) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }
  try {
    const actor = req.session?.username || "unknown";
    // Get current user info to compare suspension status
    const users = await viewUserAccountController.getAllUserAccounts();
    const user = users.find(u => u.id === id);
    const prevSuspended = user ? user.isSuspended : undefined;
    const result = await updateUserController.updateUserInfo(id, username, roleid, issuspended, actor);
    if (result) {
      let action = "update user";
      if (typeof prevSuspended === "boolean" && prevSuspended !== issuspended) {
        action = issuspended ? "suspend user" : "activate user";
      }
      await auditLogController.createAuditLog(
        actor,
        action,
        username,
        `roleid: ${roleid}, issuspended: ${issuspended}`
      );
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: "Update failed" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

//CREATE USER
router.post("/userAdmin/createUser", async(req: Request, res: Response) => {
  const { username, password, roleid } = req.body
  try { 
    const actor = req.session?.username || "unknown";
    const obj = await createUserController.createUserFunc(username, password, roleid, actor);
    if (obj) {
      await auditLogController.createAuditLog(
        actor,
        "create user",
        username,
        `roleid: ${roleid}`
      );
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


 
//VIEW USERS
// Get the users from database
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await viewUserAccountController.getAllUserAccounts();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
router.get('/roles', async (req: Request, res: Response) => {
  try {
    const roles = await db.select().from(roleTable);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});


//DELETE USER
router.delete("/users/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, error: "Missing user id" });
  }
  try {
    const actor = req.session?.username || "unknown";
    // Get username for logging
    const users = await viewUserAccountController.getAllUserAccounts();
    const user = users.find(u => u.id === id);
    const username = user ? user.username : `id:${id}`;
    const result = await updateUserController.deleteUserById(id, actor);
    if (result) {
      await auditLogController.createAuditLog(
        actor,
        "delete user",
        username,
        `id: ${id} is deleted.`
      );
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});


// Export user accounts as CSV file
router.get("/userAdmin/users/export", async (req: Request, res: Response) => {
  try {
    const actor = req.session?.username || "unknown";
    const csv = await exportUserAccountController.exportUserAccountsCSV();
    // Audit log for export action
    try {
      await auditLogController.createAuditLog(
        actor,
        "export user data",
        actor,
        `Exported ${csv.split("\n").length - 1} user accounts as CSV.`
      );
    } catch (err) {
      console.error("Audit log failed for exportUserAccountsCSV:", err);
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Failed to export user accounts as CSV" });
  }
});

 
// Create new role
router.post('/roles', async (req: Request, res: Response) => {
  const { label } = req.body;
  if (!label) {
    return res.status(400).json({ success: false, error: 'Role label required' });
  }
  try {
    const actor = req.session?.username || "unknown";
    const result = await roleController.createRole(label, actor);
    if (result) {
      await auditLogController.createAuditLog(
        actor,
        "create role",
        label,
        `Role created.`
      );
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
router.delete('/roles/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, error: 'Role id required' });
  }
  try {
    const actor = req.session?.username || "unknown";
    // Get role label for logging
    const roles = await roleController.searchRoles("");
    const role = roles.find(r => r.id === id);
    const roleLabel = role ? role.label : `id:${id}`;
    const result = await roleController.deleteRole(id, actor);
    if (result) {
      await auditLogController.createAuditLog(
        actor,
        "delete role",
        roleLabel,
        `Role deleted.`
      );
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
router.post('/roles/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { issuspended } = req.body;
  if (typeof issuspended !== 'boolean') {
    return res.status(400).json({ success: false, error: 'issuspended boolean required' });
  }
  try {
    const actor = req.session?.username || "unknown";
    const result = await roleController.setRoleSuspended(id, issuspended, actor);
    if (result) {
      // Get role label for logging
      const roles = await roleController.searchRoles("");
      const role = roles.find(r => r.id === id);
      const roleLabel = role ? role.label : `id:${id}`;
      await auditLogController.createAuditLog(
        actor,
        issuspended ? "suspend role" : "activate role",
        roleLabel,
        `id: ${id}, issuspended: ${issuspended}`
      );
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
router.get('/roles/search', async (req: Request, res: Response) => {
  const keyword = req.query.q as string || '';
  try {
    const roles = await roleController.searchRoles(keyword);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search roles' });
  }
});

// Search and filter users by username, role, and status
router.get('/users/search', async (req: Request, res: Response) => {
  const keyword = req.query.q as string || '';
  const role = req.query.role as string || '';
  const status = req.query.status as string || '';
  try {
    const actor = req.session?.username || "unknown";
    const users = await searchUserController.searchAndFilterUsers({ keyword, role, status });
    // Log search/filter action via controller
    await auditLogController.createAuditLog(
      actor,
      "search/filter users",
      actor,
      `keyword: ${keyword}, role: ${role}, status: ${status}`
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search users' });
  }
});





//AUDIT LOG

// Get audit log entries
router.get("/userAdmin/audit-log", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const logs = await auditLogController.fetchAuditLogs(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// Clear all audit logs (BCE pattern)
router.delete("/userAdmin/audit-log", async (req: Request, res: Response) => {
  try {
    if (typeof auditLogController.clearAuditLogs === "function") {
      await auditLogController.clearAuditLogs();
      res.json({ success: true });
    } else {
      // fallback if not implemented
      res.status(501).json({ error: "AuditLogController.clearAuditLogs not implemented" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to clear audit logs" });
  }
});
 
 

// Export audit logs as CSV file
router.get("/userAdmin/audit-log/export", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const csv = await auditLogController.exportAuditLogsCSV(limit);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Failed to export audit logs as CSV" });
  }
});

export { router };




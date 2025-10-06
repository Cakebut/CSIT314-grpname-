const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from 'public' folder
const publicDir = path.join(__dirname, "boundary", "public");
app.use(express.static(publicDir));
// Serve login.html at root path
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "login.html"));
});

// In-memory user store for mock registration
const users = [
  {
    id: 1,
    username: "admin",
    password: "1234",
    role: "admin",
    profile: { displayName: "Administrator" },
    roleData: { admin: { permissions: ["manage_users", "view_reports"] } }
  }
];



// Login route (for form POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    console.log(`[LOGIN] User '${username}' logged in via form.`);
    res.send(`<h2>✅ Login successful! Welcome, ${user.username}.</h2>`);
  } else {
    console.log(`[LOGIN FAIL] Invalid login attempt for username '${username}'.`);
    res.send("<h2>❌ Invalid username or password.</h2>");
  }
});

// API login route (for frontend JS)
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const token = `mock-jwt-token-${user.username}`;
    console.log(`[API LOGIN] User '${username}' logged in via API.`);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        profile: user.profile
      }
    });
  } else {
    console.log(`[API LOGIN FAIL] Invalid login attempt for username '${username}'.`);
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// API register route (for frontend JS)
app.post("/auth/register", (req, res) => {
  // Simple admin check: require Authorization header with mock token for admin
  const auth = req.headers["authorization"];
  const adminToken = `mock-jwt-token-admin`;
  if (auth !== `Bearer ${adminToken}`) {
    console.log(`[REGISTER FAIL] Unauthorized registration attempt.`);
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { username, password, role, profile, roleData } = req.body;
  if (!username || !password || !role) {
    console.log(`[REGISTER FAIL] Missing fields for user '${username}'.`);
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (users.find(u => u.username === username)) {
    console.log(`[REGISTER FAIL] Username '${username}' already exists.`);
    return res.status(409).json({ error: "Username already exists" });
  }
  const newUser = {
    id: users.length + 1,
    username,
    password,
    role,
    profile: profile || {},
    roleData: roleData || {}
  };
  users.push(newUser);
  console.log(`[REGISTER] New user registered:`, {
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
    profile: newUser.profile,
    roleData: newUser.roleData
  });
  console.log(`[USERS] Current users:`, users.map(u => ({ id: u.id, username: u.username, role: u.role })));
  res.json({
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
    profile: newUser.profile,
    roleData: newUser.roleData
  });
});
// Mock /me endpoint for authentication check
app.get("/me", (req, res) => {
  // Check for Authorization header with user-specific mock token
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer mock-jwt-token-")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const username = auth.replace("Bearer mock-jwt-token-", "");
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    profile: user.profile
  });
});


// --- MOCK ROLE ENDPOINTS FOR DASHBOARD TESTING ---
function getUserFromAuth(req) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer mock-jwt-token-")) return null;
  const username = auth.replace("Bearer mock-jwt-token-", "");
  return users.find(u => u.username === username);
}

// Admin: List all users
app.get("/admin/users", (req, res) => {
  const user = getUserFromAuth(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role, profile: u.profile })));
});

// Platform manager: Platform metrics
app.get("/platform/metrics", (req, res) => {
  const user = getUserFromAuth(req);
  if (!user || user.role !== "platform_manager") return res.status(403).json({ error: "Forbidden" });
  res.json({
    uptime: "99.95%",
    activeRegions: user.roleData?.platform_manager?.regions || ["SG", "MY"],
    kpis: user.roleData?.platform_manager?.kpis || { uptimeTarget: 99.9 }
  });
});

// CSR: My CSR cases
app.get("/csr/cases", (req, res) => {
  const user = getUserFromAuth(req);
  if (!user || user.role !== "csr") return res.status(403).json({ error: "Forbidden" });
  res.json({
    queues: user.roleData?.csr?.queues || ["general"],
    activeCases: user.roleData?.csr?.activeCases || ["CASE-101"]
  });
});

// Person in need: My Case
app.get("/pin/case", (req, res) => {
  const user = getUserFromAuth(req);
  if (!user || user.role !== "person_in_need") return res.status(403).json({ error: "Forbidden" });
  res.json({
    caseId: user.roleData?.person_in_need?.caseId || "PIN-9001",
    assistanceType: user.roleData?.person_in_need?.assistanceType || "financial"
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

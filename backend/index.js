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
    res.send(`<h2>✅ Login successful! Welcome, ${user.username}.</h2>`);
  } else {
    res.send("<h2>❌ Invalid username or password.</h2>");
  }
});

// API login route (for frontend JS)
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Return a user-specific mock JWT and user object
    const token = `mock-jwt-token-${user.username}`;
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
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// API register route (for frontend JS)
app.post("/auth/register", (req, res) => {
  // Simple admin check: require Authorization header with mock token for admin
  const auth = req.headers["authorization"];
  const adminToken = `mock-jwt-token-admin`;
  if (auth !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { username, password, role, profile, roleData } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (users.find(u => u.username === username)) {
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

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

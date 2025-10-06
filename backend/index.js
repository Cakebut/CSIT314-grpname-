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


// Login route (for form POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    res.send("<h2>✅ Login successful! Welcome, admin.</h2>");
  } else {
    res.send("<h2>❌ Invalid username or password.</h2>");
  }
});

// API login route (for frontend JS)
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    // Return a mock JWT and user object
    res.json({
      token: "mock-jwt-token",
      user: {
        id: 1,
        username: "admin",
        role: "admin",
        profile: { displayName: "Administrator" }
      }
    });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});
// Mock /me endpoint for authentication check
app.get("/me", (req, res) => {
  // Check for Authorization header with mock token
  const auth = req.headers["authorization"];
  if (auth === "Bearer mock-jwt-token") {
    res.json({
      id: 1,
      username: "admin",
      role: "admin",
      profile: { displayName: "Administrator" }
    });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

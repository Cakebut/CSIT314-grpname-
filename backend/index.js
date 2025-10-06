const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, "boundary\public")));
// Serve login.html at root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "boundary/public/login.html"));
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Mock login check
  if (username === "admin" && password === "1234") {
    res.send("<h2>✅ Login successful! Welcome, admin.</h2>");
  } else {
    res.send("<h2>❌ Invalid username or password.</h2>");
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

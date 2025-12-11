// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");

// Helper to read saved data (simple file persistence)
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return {}; // empty if file doesn't exist
  }
}

// Helper to write data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// POST /save -> save tracking data from extension
app.post("/save", (req, res) => {
  const payload = req.body;
  if (!payload || !payload.tracking) {
    return res.status(400).json({ error: "Invalid payload, expected {tracking: {...}}" });
  }

  const existing = readData();
  const userId = payload.userId || "default";

  existing[userId] = existing[userId] || {};

  for (const [site, ms] of Object.entries(payload.tracking)) {
    existing[userId][site] = (existing[userId][site] || 0) + ms;
  }

  writeData(existing);
  res.json({ status: "ok", savedFor: userId });
});

// GET /report/:userId -> specific user report
app.get("/report/:userId", (req, res) => {
  const userId = req.params.userId;
  const existing = readData();
  res.json(existing[userId] || {});
});

// GET /report -> default user
app.get("/report", (req, res) => {
  const existing = readData();
  res.json(existing["default"] || {});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

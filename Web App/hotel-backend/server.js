const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(bodyParser.json());

// Database connection
const db = new sqlite3.Database("./hotel.db");

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_no TEXT,
      room_type TEXT,
      ac_status TEXT,
      clean_status TEXT,
      bed_type TEXT,
      price REAL,
      booking_status TEXT,
      checkout_date TEXT
    )
  `);
  db.run(
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      room_no TEXT NOT NULL
    )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS sensors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_no TEXT NOT NULL,
      temperature REAL,
      humidity REAL,
      co REAL,
      butane_gas REAL,
      co2 REAL,
      smoke REAL,
      light REAL,
      motion INTEGER,
      lights INTEGER,
      fan INTEGER,
      curtains INTEGER,
      windows INTEGER
    )`
  );
});

// Dummy users (only run once)
db.run("INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')");
db.run("INSERT OR IGNORE INTO users (username, password, role) VALUES ('customer', 'customer123', 'customer')");

// Routes
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check for admin credentials
  if (username === "admin" && password === "yassine") {
    return res.json({ role: "admin" });
  }

  // Check in customers table
  db.get("SELECT * FROM customers WHERE name = ? AND room_no = ?", [username, password], (err, row) => {
    if (err) return res.status(500).json({ message: "Error checking credentials" });
    if (row) {
      return res.json({ role: "customer" });
    } else {
      return res.status(401).json({ message: "Invalid login credentials" });
    }
  });
});

app.get("/rooms", (req, res) => {
  db.all("SELECT * FROM rooms", (err, rooms) => {
    if (err) return res.status(500).json({ message: "Error loading rooms" });
    res.json(rooms);
  });
});

app.post("/add-room", (req, res) => {
  const { room_no, room_type, ac_status, clean_status, bed_type, price, booking_status, checkout_date } = req.body;
  db.run(
    "INSERT INTO rooms (room_no, room_type, ac_status, clean_status, bed_type, price, booking_status, checkout_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [room_no, room_type, ac_status, clean_status, bed_type, price, booking_status, checkout_date],
    (err) => {
      if (err) return res.status(500).json({ message: "Error adding room" });
      res.json({ message: "Room added successfully" });
    }
  );
});

app.delete("/remove-room/:id", (req, res) => {
  const roomId = req.params.id;
  db.run("DELETE FROM rooms WHERE id = ?", [roomId], (err) => {
    if (err) return res.status(500).json({ message: "Error removing room" });
    res.json({ message: "Room removed successfully" });
  });
});

app.post("/add-customer", (req, res) => {
  const { name, room_no } = req.body;
  db.run(
    "INSERT INTO customers (name, room_no) VALUES (?, ?)",
    [name, room_no],
    (err) => {
      if (err) return res.status(500).json({ message: "Error adding customer" });
      res.json({ message: "Customer added successfully" });
    }
  );
});

app.get("/customers", (req, res) => {
  db.all("SELECT * FROM customers", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching customers" });
    res.json(rows);
  });
});

// Route to remove a customer
app.delete("/remove-customer/:id", (req, res) => {
  const customerId = req.params.id;
  db.run("DELETE FROM customers WHERE id = ?", [customerId], (err) => {
    if (err) return res.status(500).json({ message: "Error removing customer" });

    // Reset the auto-increment counter
    db.run("DELETE FROM sqlite_sequence WHERE name='customers'", (err) => {
      if (err) return res.status(500).json({ message: "Error resetting auto-increment" });
      res.json({ message: "Customer removed and auto-increment reset successfully" });
    });
  });
});

// Route to get the most recent sensor data for a specific room
app.get("/sensors/:room_no", (req, res) => {
  const roomNo = req.params.room_no;
  db.get(
    "SELECT * FROM sensors WHERE room_no = ? ORDER BY id DESC LIMIT 1",
    [roomNo],
    (err, row) => {
      if (err) return res.status(500).json({ message: "Error fetching sensor data" });
      res.json(row);
    }
  );
});

// Route to get the control states for a specific room from the sensors table
app.get("/controls/:room_no", (req, res) => {
  const roomNo = req.params.room_no;
  db.get(
    "SELECT lights, fan, curtains, windows FROM sensors WHERE room_no = ?",
    [roomNo],
    (err, row) => {
      if (err) return res.status(500).json({ message: "Error fetching control states" });
      res.json(row);
    }
  );
});

// Route to update control states for a specific room in the sensors table
app.post("/controls/:room_no", (req, res) => {
  const roomNo = req.params.room_no;
  const { lights, fan, curtains, windows } = req.body; // Assuming these are the controls you want to update
  db.run(
    "UPDATE sensors SET lights = ?, fan = ?, curtains = ?, windows = ? WHERE room_no = ?",
    [lights, fan, curtains, windows, roomNo],
    (err) => {
      if (err) return res.status(500).json({ message: "Error updating control states" });
      res.json({ message: "Control states updated successfully" });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

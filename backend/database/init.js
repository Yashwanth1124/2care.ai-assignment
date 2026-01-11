const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'healthwallet.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'Owner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Reports table
  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    report_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Vitals table
  db.run(`CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vital_type TEXT NOT NULL,
    value REAL NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Report vitals mapping (many-to-many)
  db.run(`CREATE TABLE IF NOT EXISTS report_vitals (
    report_id INTEGER NOT NULL,
    vital_type TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, vital_type)
  )`);

  // Shared access table
  db.run(`CREATE TABLE IF NOT EXISTS shared_access (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    shared_with_email TEXT NOT NULL,
    access_type TEXT DEFAULT 'read',
    shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
  )`);

  // Create indexes for better query performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_vitals_user_id ON vitals(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_vitals_recorded_at ON vitals(recorded_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_shared_access_email ON shared_access(shared_with_email)`);

  console.log('Database tables initialized');
});

module.exports = db;
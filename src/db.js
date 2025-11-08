const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'queue.db');

function init() {
  // Create DB file if missing
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  const db = new Database(dbPath);

  // Create jobs table safely
  db.prepare(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command TEXT NOT NULL,
      state TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      locked_by TEXT,
      locked_at TEXT,
      created_at TEXT,
      updated_at TEXT,
      last_error TEXT,
      available_at TEXT
    )
  `).run();

  
  const columns = db.prepare("PRAGMA table_info(jobs)").all();
  const columnNames = columns.map(c => c.name);

  // Only add columns if they don't already exist
  const addColumnIfMissing = (col, type) => {
    if (!columnNames.includes(col)) {
      db.prepare(`ALTER TABLE jobs ADD COLUMN ${col} ${type}`).run();
    }
  };

  // Example of safe schema migrations
  addColumnIfMissing('priority', 'INTEGER');
  addColumnIfMissing('retries', 'INTEGER DEFAULT 0'); // safe: only adds if missing

  return db;
}

module.exports = { init };

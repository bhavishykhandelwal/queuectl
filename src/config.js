const Database = require('better-sqlite3');
const path = require('path');

// Use the same database file as the rest of the system
const dbPath = path.join(__dirname, 'queue.db');
const db = new Database(dbPath);

// Create config table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`).run();

// --- Set a configuration value ---
function setConfig(key, value) {
  const insert = db.prepare(`
    INSERT INTO config (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value
  `);
  insert.run(key, value);
}

// --- Get a configuration value ---
function getConfig(key) {
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key);
  return row ? row.value : null;
}

// --- List all configuration entries ---
function listConfig() {
  return db.prepare('SELECT * FROM config').all();
}

module.exports = {
  setConfig,
  getConfig,
  listConfig,
};

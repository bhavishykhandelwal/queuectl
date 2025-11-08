// src/db.js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'queue.db'));

function init() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command TEXT NOT NULL,
      state TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      locked_by TEXT,
      locked_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_error TEXT
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `).run();
}

module.exports = { db, init };
db.prepare('ALTER TABLE jobs ADD COLUMN retries INTEGER DEFAULT 0').run();


function timedQuery(sql) {
  const start = Date.now();
  const result = db.prepare(sql).all();
  console.log(`[DB] Query took ${Date.now() - start}ms`);
  return result;
}
exports.timedQuery = timedQuery;
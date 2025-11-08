const path = require('path');
const Database = require('better-sqlite3');
const DB_PATH = process.env.QUEUECTL_DB || path.join(process.cwd(), 'queuectl.db');


const db = new Database(DB_PATH);

function init() {
db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS jobs (
id TEXT PRIMARY KEY,
command TEXT NOT NULL,
state TEXT NOT NULL,
attempts INTEGER NOT NULL DEFAULT 0,
max_retries INTEGER NOT NULL DEFAULT 3,
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
locked_by TEXT,
locked_at TEXT,
last_error TEXT
);
CREATE TABLE IF NOT EXISTS config (
key TEXT PRIMARY KEY,
value TEXT NOT NULL
);
`);
// default config values
const get = db.prepare('SELECT value FROM config WHERE key = ?');
const set = db.prepare('INSERT OR REPLACE INTO config (key,value) VALUES (?,?)');
if (!get.get('backoff_base')) set.run('backoff_base', '2');
if (!get.get('max_retries')) set.run('max_retries', '3');
}

module.exports = { db, init };
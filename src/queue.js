const Database = require('better-sqlite3');
const db = new Database('src/queue.db');

// --- Enqueue a job ---
function enqueue(job) {
  const insert = db.prepare(`
    INSERT INTO jobs (command, state, attempts, max_retries, created_at, updated_at)
    VALUES (@command, 'pending', 0, 3, datetime('now'), datetime('now'))
  `);
  const result = insert.run(job);
  return { id: result.lastInsertRowid, ...job, state: 'pending', attempts: 0, max_retries: 3 };
}

// --- List jobs ---
function list(state = null) {
  if (state) {
    return db.prepare('SELECT * FROM jobs WHERE state = ? ORDER BY id DESC').all(state);
  }
  return db.prepare('SELECT * FROM jobs ORDER BY id DESC').all();
}

// --- Get job by ID ---
function get(id) {
  return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
}

// --- Move job to another state ---
function moveToState(id, newState, error = null) {
  const stmt = db.prepare(`
    UPDATE jobs
    SET state = ?, updated_at = datetime('now'), last_error = ?
    WHERE id = ?
  `);
  stmt.run(newState, error, id);
}

// --- Export all ---
module.exports = {
  enqueue,
  list,
  get,
  moveToState,
};

function moveToDLQ(job, error) {
  db.prepare('UPDATE jobs SET state="dead", last_error=? WHERE id=?').run(error.message, job.id);
}

if (typeof job.command !== 'string' || job.command.trim() === '') {
  throw new Error('Invalid job: command must be non-empty string');
}

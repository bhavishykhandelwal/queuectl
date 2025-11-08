const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');

const insertJob = db.prepare(`
INSERT INTO jobs (id, command, state, attempts, max_retries, created_at, updated_at)
VALUES (@id,@command,@state,@attempts,@max_retries,@created_at,@updated_at)
`);

const getJob = db.prepare('SELECT * FROM jobs WHERE id = ?');
const listByState = db.prepare('SELECT * FROM jobs WHERE state = ? ORDER BY created_at');

function enqueue(jobObj) {
const now = new Date().toISOString();
const job = {
id: jobObj.id || uuidv4(),
command: jobObj.command,
state: 'pending',
attempts: jobObj.attempts || 0,
max_retries: jobObj.max_retries || 3,
created_at: now,
updated_at: now
};
insertJob.run(job);
return job;
}

function list(state) {
if (state) return listByState.all(state);
return db.prepare('SELECT * FROM jobs ORDER BY created_at').all();
}

function get(id) { return getJob.get(id); }

function moveToState(id, state, extras = {}) {
const now = new Date().toISOString();
const stmt = db.prepare(`
UPDATE jobs SET state = @state, updated_at = @updated_at, locked_by = @locked_by, locked_at = @locked_at, attempts = @attempts, last_error = @last_error WHERE id = @id
`);
stmt.run({
id,
state,
updated_at: now,
locked_by: extras.locked_by || null,
locked_at: extras.locked_at || null,
attempts: extras.attempts !== undefined ? extras.attempts : get(id).attempts,
last_error: extras.last_error || null
});
}

module.exports = { enqueue, list, get, moveToState };
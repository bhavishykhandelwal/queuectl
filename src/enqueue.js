const { db } = require('./db');

function enqueue(command) {
  if (typeof command !== 'string' || command.trim() === '') {
    console.error('Invalid command: must be a non-empty string.');
    process.exit(1);
  }

  const insert = db.prepare(`
    INSERT INTO jobs (command, state, attempts, max_retries, created_at, updated_at)
    VALUES (?, 'pending', 0, 3, datetime('now'), datetime('now'))
  `);
  
  const result = insert.run(command);
  console.log(`✅ Job #${result.lastInsertRowid} enqueued: "${command}"`);
}

module.exports = { enqueue };

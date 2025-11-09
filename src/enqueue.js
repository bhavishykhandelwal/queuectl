// src/enqueue.js

import db from './db.js';
import { logSuccess, logInfo, logError } from './logger.js';

export function enqueueJob(command) {
  try {
    const stmt = db.prepare(`
      INSERT INTO jobs (command, state) VALUES (?, 'pending')
    `);
    const info = stmt.run(command);
    logSuccess(`Enqueued job ID ${info.lastInsertRowid}: ${command}`);
  } catch (err) {
    logError(`Failed to enqueue job: ${err.message}`);
  }
}

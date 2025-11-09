import db from './db.js';
import { logInfo, logError } from './logger.js';
import { exec } from 'child_process';
import util from 'util';
import { sleep } from './utils.js';

const execAsync = util.promisify(exec);

export async function workerLoop(workerId) {
  while (true) {
    const job = db.prepare(`SELECT * FROM jobs WHERE state='pending' ORDER BY id LIMIT 1`).get();

    if (!job) {
      await sleep(1000);
      continue;
    }

    db.prepare(`UPDATE jobs SET state='running', updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(job.id);
    logInfo(`Worker ${workerId} started job ${job.id}`);

    try {
      const { stdout } = await execAsync(job.command);
      db.prepare(`
        UPDATE jobs SET state='completed', last_output=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
      `).run(stdout, job.id);
      logInfo(`Worker ${workerId} finished job ${job.id} ✅`);
    } catch (err) {
      logError(`Worker ${workerId} failed job ${job.id}: ${err.message}`);
      db.prepare(`
        UPDATE jobs SET state='failed', last_error=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
      `).run(err.message, job.id);
    }

    await sleep(500);
  }
}

const { db } = require('./db');
const { getConfig } = require('./config');
const { exec } = require('child_process');

let running = false;
let workerIdCounter = 0;

/**
 * Ensure migration: add available_at column if it doesn't exist.
 * Safe to call repeatedly.
 */
function ensureAvailableAtColumn() {
  try {
    db.prepare("SELECT available_at FROM jobs LIMIT 1").get();
  } catch (e) {
    // column missing: alter table (wrap in try/catch because concurrent runs might race)
    try {
      db.prepare("ALTER TABLE jobs ADD COLUMN available_at TEXT").run();
    } catch (err) {
      // ignore if already added by another process
    }
  }
}

function startWorkers(count = 1) {
  ensureAvailableAtColumn();
  running = true;
  for (let i = 0; i < count; i++) {
    spawnWorker(`worker-${++workerIdCounter}`);
  }
}

function stopWorkers() {
  // stop picking new jobs, workers finish in-flight job and exit loop
  running = false;
}

function spawnWorker(workerId) {
  (async function loop() {
    console.log(`[${workerId}] started`);
    while (running) {
      const job = pickJob(workerId);
      if (!job) {
        await sleep(1000);
        continue;
      }
      try {
        await processJob(job, workerId);
      } catch (err) {
        console.error(`[${workerId}] unexpected error processing job ${job.id}:`, err);
      }
    }
    console.log(`[${workerId}] shutting down`);
  })();
}

/**
 * Atomically pick a single pending job that is available now.
 * Uses a transaction so only one worker picks a job.
 */
function pickJob(workerId) {
  const t = db.transaction(() => {
    // select pending job that is available (available_at IS NULL OR <= now)
    const now = new Date().toISOString();
    const job = db
      .prepare(
        `SELECT * FROM jobs
         WHERE state = 'pending' AND (available_at IS NULL OR available_at <= ?)
         ORDER BY created_at
         LIMIT 1`
      )
      .get(now);

    if (!job) return null;

    db.prepare(
      `UPDATE jobs
       SET state = 'processing', locked_by = ?, locked_at = ?, updated_at = ?
       WHERE id = ?`
    ).run(workerId, now, now, job.id);

    return db.prepare('SELECT * FROM jobs WHERE id = ?').get(job.id);
  });

  try {
    return t();
  } catch (err) {
    console.error(`[${workerId}] pickJob transaction failed:`, err);
    return null;
  }
}

/**
 * Execute the job.command, update attempts, set backoff or dead state.
 */
function processJob(job, workerId) {
  return new Promise((resolve) => {
    const child = exec(job.command, { shell: true }, (error, stdout, stderr) => {
      const success = !error;
      const attempts = (job.attempts || 0) + 1;
      const maxRetries = job.max_retries || Number(getConfig('max_retries') || 3);

      if (success) {
        db.prepare(
          `UPDATE jobs
           SET state = 'completed',
               attempts = ?,
               updated_at = ?,
               locked_by = NULL,
               locked_at = NULL,
               last_error = NULL,
               available_at = NULL
           WHERE id = ?`
        ).run(attempts, new Date().toISOString(), job.id);

        console.log(`[${workerId}] completed job ${job.id} (${job.command})`);
        resolve();
      } else {
        // compute backoff and either retry or move to DLQ
        const base = Number(getConfig('backoff_base') || 2);
        if (attempts > maxRetries) {
          db.prepare(
            `UPDATE jobs
             SET state = 'dead',
                 attempts = ?,
                 updated_at = ?,
                 locked_by = NULL,
                 locked_at = NULL,
                 last_error = ?
             WHERE id = ?`
          ).run(attempts, new Date().toISOString(), String(stderr || error.message), job.id);

          console.log(
            `[${workerId}] job ${job.id} moved to DLQ after ${attempts} attempts (command: ${job.command})`
          );
          resolve();
        } else {
          const delaySeconds = Math.pow(base, attempts);
          const nextRun = new Date(Date.now() + delaySeconds * 1000).toISOString();

          db.prepare(
            `UPDATE jobs
             SET state = 'pending',
                 attempts = ?,
                 updated_at = ?,
                 locked_by = NULL,
                 locked_at = NULL,
                 last_error = ?,
                 available_at = ?
             WHERE id = ?`
          ).run(
            attempts,
            new Date().toISOString(),
            String(stderr || error.message),
            nextRun,
            job.id
          );

          console.log(
            `[${workerId}] job ${job.id} failed (attempt ${attempts}/${maxRetries}). retrying in ${delaySeconds}s`
          );
          resolve();
        }
      }
    });

    // stream stdout/stderr for visibility
    if (child.stdout) child.stdout.pipe(process.stdout);
    if (child.stderr) child.stderr.pipe(process.stderr);
  });
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

module.exports = { startWorkers, stopWorkers };

logger.warn(`Job ${job.id} failed attempt #${job.retries}`);


const duration = Date.now() - start;
logger.info(`Job ${job.id} completed in ${duration} ms`);

const metrics = require('./metrics');
metrics.incProcessed(); // success
metrics.incFailed();    // failure


process.on('SIGINT', () => {
  logger.info('Graceful shutdown...');
  stopWorkers();
  process.exit(0);
});

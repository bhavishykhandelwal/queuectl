import { execSync } from 'child_process';
import { getPendingJob, updateJobStatus } from './queue.js';

export function startWorkers(count = 1) {
  console.log(`🚀 Starting ${count} worker(s)...`);

  for (let i = 0; i < count; i++) {
    runWorker(i + 1);
  }
}

function runWorker(workerId) {
  setInterval(() => {
    const job = getPendingJob();
    if (job) {
      console.log(`🧠 Worker ${workerId} picked job #${job.id}`);
      updateJobStatus(job.id, 'running');

      try {
        const output = execSync(job.command, { encoding: 'utf8' });
        console.log(`✅ Job #${job.id} completed:\n${output}`);
        updateJobStatus(job.id, 'completed');
      } catch (err) {
        console.error(`❌ Job #${job.id} failed: ${err.message}`);
        updateJobStatus(job.id, 'failed');
      }
    }
  }, 2000);
}

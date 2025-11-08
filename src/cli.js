#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const { init } = require('./db');
const { enqueue, list, get, moveToState } = require('./queue');
const { startWorkers, stopWorkers } = require('./worker');
const { setConfig, getConfig } = require('./config');
const Database = require('better-sqlite3');

// Initialize database
init();
const db = new Database('src/queue.db');

// CLI setup
program
  .name('queuectl')
  .description('CLI job queue with retries and DLQ')
  .version('0.1.0');

// Enqueue command
program
  .command('enqueue')
  .argument('<job-json>', 'job as JSON string')
  .description('Enqueue a new job')
  .action((jobJson) => {
    const obj = JSON.parse(jobJson);
    if (!obj.command) {
      console.error('Job must include a "command" field');
      process.exit(2);
    }
    const job = enqueue(obj);
    console.log('Enqueued job:', job);
  });

// List jobs
program
  .command('list')
  .option('--state <state>', 'Filter by state (pending, completed, dead)')
  .description('List jobs in the queue')
  .action((options) => {
    const jobs = list(options.state);
    console.table(jobs);
  });

// Status command
program
  .command('status')
  .description('Show summary of all job states')
  .action(() => {
    const counts = db
      .prepare('SELECT state, COUNT(*) as count FROM jobs GROUP BY state')
      .all();
    console.table(counts);
  });

// Worker management
const worker = program.command('worker').description('Manage workers');

// Worker start
worker
  .command('start')
  .option('--count <n>', 'Number of workers to start', '1')
  .description('Start worker(s)')
  .action((options) => {
    const count = parseInt(options.count || '1');
    console.log(`Starting ${count} worker(s)...`);
    startWorkers(count);
  });

// Worker stop
worker
  .command('stop')
  .description('Stop all workers')
  .action(() => {
    console.log('Stopping workers...');
    stopWorkers();
  });

// Dead Letter Queue management
const dlq = program.command('dlq').description('Dead Letter Queue management');

// DLQ list
dlq
  .command('list')
  .description('List dead jobs')
  .action(() => {
    const jobs = list('dead');
    console.table(jobs);
  });

// DLQ retry
dlq
  .command('retry')
  .argument('<id>', 'Retry a dead job by ID')
  .description('Retry a job from the Dead Letter Queue')
  .action((id) => {
    const job = get(id);
    if (!job) {
      console.log('Job not found.');
      return;
    }
    moveToState(id, 'pending');
    console.log(`Moved job ${id} back to pending queue`);
  });

// Parse CLI arguments
program.parse(process.argv);

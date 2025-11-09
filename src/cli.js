#!/usr/bin/env node
import { Command } from 'commander';
import { enqueueJob } from './enqueue.js';
import { workerLoop } from './queue.js';
import { showStatus } from './status.js';
import { showMetrics } from './metrics.js';
import { initDB } from './db.js';

initDB();

const program = new Command();
program
  .name('queuectl')
  .description('CLI Job Queue with retries and metrics')
  .version('1.0.0');

program
  .command('enqueue <command>')
  .description('Enqueue a new job')
  .action(enqueueJob);

program
  .command('worker')
  .option('--count <num>', 'number of workers', '1')
  .action((opts) => {
    const count = parseInt(opts.count);
    for (let i = 1; i <= count; i++) {
      workerLoop(i);
    }
  });

program
  .command('status')
  .description('Show job queue status')
  .action(showStatus);

program
  .command('metrics')
  .description('Show queue metrics')
  .action(showMetrics);

program.parse();

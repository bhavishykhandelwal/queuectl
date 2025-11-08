#!/usr/bin/env node
const { program } = require('commander');
const { enqueue } = require('./enqueue');
const { showStatus } = require('./status');
const { startWorkers, stopWorkers } = require('./worker');

program
  .name('queuectl')
  .description('Queue control CLI tool')
  .version('1.0.0');

// Start workers
program
  .command('start')
  .description('Start queue workers')
  .option('-c, --count <number>', 'number of workers to start', '1')
  .action((options) => {
    const count = parseInt(options.count, 10);
    console.log(`Starting ${count} worker(s)...`);
    startWorkers(count);
  });

// Stop workers (optional)
program
  .command('stop')
  .description('Stop queue workers gracefully')
  .action(() => {
    stopWorkers();
    console.log('Workers stopped gracefully.');
  });

// Enqueue job
program
  .command('enqueue <command>')
  .description('Enqueue a new job with the given shell command')
  .action((cmd) => {
    enqueue(cmd);
  });

// Show status
program
  .command('status')
  .description('Show queue and worker status')
  .action(() => {
    showStatus();
  });

program.parse(process.argv);

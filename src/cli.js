#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const { init } = require('./db');
const { enqueue, list, get, moveToState } = require('./queue');
const { startWorkers, stopWorkers } = require('./worker');
const { setConfig, getConfig } = require('./config');

(async () => {
  // Initialize the database before CLI runs
  await init();

  program
    .name('queuectl')
    .description('CLI job queue with retries and DLQ')
    .version('0.1.0');
// enqueue command
  program
    .command('enqueue')
    .argument('<job-json>', 'Job as JSON string')
    .description('Enqueue a new job')
    .action((jobJson) => {
      let obj;
      try {
        obj = JSON.parse(jobJson);
      } catch (err) {
        console.error('❌ Invalid JSON:', err.message);
        process.exit(1);
      }

      if (!obj.command) {
        console.error('❌ Job must include a "command" property');
        process.exit(2);
      }

      const job = enqueue(obj);
      console.log('✅ Enqueued job:', job);
    });

  // Parse CLI arguments
  await program.parseAsync(process.argv);
})();

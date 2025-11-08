#!/usr/bin/env node
import { Command } from 'commander';
import { enqueueTask, showStatus, startWorker } from './queue.js';

const program = new Command();

program
  .name('queuectl')
  .description('CLI tool for managing a simple task queue')
  .version('1.0.0');

program
  .command('enqueue <task>')
  .description('Add a task to the queue')
  .action(async (task) => {
    await enqueueTask(task);
    console.log(`✅ Task added: ${task}`);
  });

program
  .command('status')
  .description('Show current queue status')
  .action(async () => {
    await showStatus();
  });

program
  .command('start')
  .description('Start processing tasks in the queue')
  .action(async () => {
    await startWorker();
  });

program.parse(process.argv);

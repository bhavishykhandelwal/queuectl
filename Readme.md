# QueueCTL – CLI-based Background Job Queue System

QueueCTL is a production-grade, CLI-based job queue system built with **Node.js**. It allows background jobs to be enqueued, processed by multiple worker processes, retried automatically with **exponential backoff**, and moved to a **Dead Letter Queue (DLQ)** for permanently failed jobs. Job data persists across restarts using **SQLite**.

---

## Features

- Enqueue and manage background jobs via CLI.
- Multiple worker support for concurrent job processing.
- Automatic retry for failed jobs using **exponential backoff**.
- **Dead Letter Queue (DLQ)** for permanently failed jobs.
- Persistent storage using SQLite.
- Graceful worker shutdown and locking to prevent duplicate job execution.
- Configurable retry count and backoff base.
- Detailed logs for auditing and debugging.

---

## 📦 Installation

1. Clone the repository:

```bash
gh repo clone bhavishykhandelwal/queuectl
cd queuectl

2.install dependecies
npm install

3 . Manage node Version
npm install -g n
sudo n 22.11.0


Enqueue Jobs->
queuectl enqueue "echo 'Hello World'"
queuectl enqueue "ls -l"
queuectl enqueue "pwd"



Start Workers->
queuectl worker start --count 4

Stop Workers->
queuectl worker stop


View Queue Status->
queuectl status

Sample Output->
Queue Status:
  pending: 2
  processing: 0
  completed: 5
  failed: 1
  dead: 0


List Jobs By State->
queuectl list --state pending
queuectl list --state dead

DLQ Management->
queuectl dlq list
queuectl dlq retry <job_id>

Configuration->
queuectl config set max-retries 3
queuectl config set backoff-base 2

Architecture Overview->

Job Storage: SQLite database ensures persistent storage of jobs and states.
Worker Logic: Workers lock a job, execute it, update its state, and log results.
Retry Mechanism: Jobs failing are retried automatically with exponential backoff:

Project Structure->
queuectl/
├─ src/
│  ├─ enqueue.js       # Job enqueue logic
│  ├─ worker.js        # Worker execution logic
│  ├─ db.js            # SQLite DB connection
│  └─ logger.js        # Logging utilities
├─ logs/               # Worker logs
├─ package.json
└─ README.md




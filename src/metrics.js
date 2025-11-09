import db from './db.js';

export function showMetrics() {
  const total = db.prepare('SELECT COUNT(*) as total FROM jobs').get().total;
  const completed = db.prepare(`SELECT COUNT(*) as done FROM jobs WHERE state='completed'`).get().done;
  console.log(`\nMetrics: Total=${total}, Completed=${completed}`);
}

import db from './db.js';

export function showStatus() {
  const states = db.prepare(`
    SELECT state, COUNT(*) AS count FROM jobs GROUP BY state
  `).all();

  console.log('\nQueue Status:');
  for (const s of states) {
    console.log(`  ${s.state}: ${s.count}`);
  }
}

const { db } = require('./db');

const get = db.prepare('SELECT value FROM config WHERE key = ?');
const set = db.prepare('INSERT OR REPLACE INTO config (key,value) VALUES (?,?)');

function getConfig(key) {
const row = get.get(key);
return row ? row.value : null;
}

function setConfig(key, value) {
set.run(key, String(value));
}

module.exports = { getConfig, setConfig };

let cache = null;
function read() {
  if (cache) return cache;
  const data = JSON.parse(fs.readFileSync(CFG, 'utf8'));
  cache = data;
  return data;
}
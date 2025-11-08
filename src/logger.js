const { timestamp } = require('./utils');
module.exports = {
  info: (...args) => console.log(`[INFO ${timestamp()}]`, ...args),
  error: (...args) => console.error(`[ERR ${timestamp()}]`, ...args)
};

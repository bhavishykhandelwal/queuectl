const { timestamp } = require('./utils');
module.exports = {
  info: (...args) => console.log(`[INFO ${timestamp()}]`, ...args),
  error: (...args) => console.error(`[ERR ${timestamp()}]`, ...args)
};
const chalk = require('chalk');
module.exports = {
  info: (...args) => console.log(chalk.blue(`[INFO ${new Date().toISOString()}]`), ...args),
  warn: (...args) => console.warn(chalk.yellow(`[WARN ${new Date().toISOString()}]`), ...args),
  error: (...args) => console.error(chalk.red(`[ERROR ${new Date().toISOString()}]`), ...args)
};

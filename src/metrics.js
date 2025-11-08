let counters = { processed: 0, failed: 0 };
module.exports = {
  incProcessed: () => counters.processed++,
  incFailed: () => counters.failed++,
  getAll: () => counters
};
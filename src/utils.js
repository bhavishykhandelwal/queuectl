exports.timestamp = () => new Date().toISOString();

exports.safeStringify = (obj) => {
  try { return JSON.stringify(obj, null, 2); } catch { return '{}'; }
};

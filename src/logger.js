// src/logger.js

export function logInfo(message) {
  console.log(`[INFO] ${message}`);
}

export function logSuccess(message) {
  console.log(`[SUCCESS] ${message}`);
}

export function logError(message) {
  console.error(`[ERROR] ${message}`);
}

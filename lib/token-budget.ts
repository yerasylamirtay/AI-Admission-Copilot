import fs from 'node:fs';
import path from 'node:path';

export const MAX_AI_CALLS = 60;
const USAGE_FILE = '/tmp/token-usage.json';
let memoryCount = 0;

function readCount() {
  try {
    const value = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
    return typeof value.calls === 'number' ? value.calls : memoryCount;
  } catch {
    return memoryCount;
  }
}

function writeCount(calls: number) {
  memoryCount = calls;
  try {
    fs.mkdirSync(path.dirname(USAGE_FILE), { recursive: true });
    fs.writeFileSync(USAGE_FILE, JSON.stringify({ calls }), 'utf8');
  } catch {
    // Some serverless hosts do not allow writes; the in-memory fallback remains valid.
  }
}

export function getTokenBudget() {
  const calls = Math.min(readCount(), MAX_AI_CALLS);
  return { calls, remaining: Math.max(0, MAX_AI_CALLS - calls), max: MAX_AI_CALLS };
}

export function checkAndIncrementBudget() {
  const current = getTokenBudget();
  if (current.remaining <= 0) return { allowed: false, ...current };
  const calls = current.calls + 1;
  writeCount(calls);
  return { allowed: true, calls, remaining: MAX_AI_CALLS - calls, max: MAX_AI_CALLS };
}

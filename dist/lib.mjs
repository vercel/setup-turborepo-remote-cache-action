import { appendFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

export const TURBO_APP_ID = 'cl_kyUx2zVvA4MGptBohkmtYHJly2XltXzD';
export const TOKEN_URL = 'https://api.vercel.com/login/oauth/token';
export const REVOKE_URL = 'https://api.vercel.com/login/oauth/token/revoke';

const REQUEST_TIMEOUT_MS = 30_000;
const REQUEST_ATTEMPTS = 3;

export function input(name) {
  const value = process.env[`INPUT_${name.toUpperCase().replace(/ /g, '_')}`];
  return value === undefined ? '' : value.trim();
}

export function booleanInput(name, fallback) {
  const value = input(name);
  if (value === '') return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Input "${name}" must be "true" or "false", got "${value}"`);
}

export function log(message) {
  process.stdout.write(`${message}\n`);
}

export function mask(value) {
  if (value) log(`::add-mask::${value}`);
}

export function warn(message) {
  log(`::warning::${message}`);
}

export function fail(message) {
  log(`::error::${message}`);
  process.exit(1);
}

function writeEnvFile(pathEnvVar, name, value) {
  const file = process.env[pathEnvVar];
  if (!file) throw new Error(`${pathEnvVar} is not set`);
  const delimiter = `EOF_${randomUUID()}`;
  appendFileSync(file, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
}

export const exportVariable = (name, value) =>
  writeEnvFile('GITHUB_ENV', name, value);

export const saveState = (name, value) =>
  writeEnvFile('GITHUB_STATE', name, value);

export const getState = (name) => process.env[`STATE_${name}`] || '';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request(url, init = {}) {
  let lastError;

  for (let attempt = 1; attempt <= REQUEST_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.status !== 429 && response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < REQUEST_ATTEMPTS) await sleep(attempt * 1000);
  }

  throw lastError;
}

export async function errorDetail(response) {
  let body = '';
  try {
    body = (await response.text()).trim().replace(/\s+/g, ' ');
  } catch {
    body = '';
  }
  if (body.length > 500) body = `${body.slice(0, 500)}…`;
  return body
    ? `HTTP ${response.status} ${response.statusText}: ${body}`
    : `HTTP ${response.status} ${response.statusText}`;
}

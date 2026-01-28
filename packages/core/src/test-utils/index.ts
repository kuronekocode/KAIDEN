/**
 * Test utilities for vitest
 * Provides helpers for Result type assertions and common test patterns
 */

import { describe, it, expect } from 'vitest';
import type { Result } from '../types/index.js';

/**
 * Assert that a Result is Ok and return the value
 */
export function assertOk<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(`Expected Ok, got Err: ${JSON.stringify(result.error)}`);
  }
  return result.value;
}

/**
 * Assert that a Result is Err and return the error
 */
export function assertErr<T, E>(result: Result<T, E>): E {
  if (result.ok) {
    throw new Error(`Expected Err, got Ok: ${JSON.stringify(result.value)}`);
  }
  return result.error;
}

/**
 * Create a temporary directory for testing
 */
export async function createTempDir(): Promise<string> {
  const { mkdtemp } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  return mkdtemp(join(tmpdir(), 'kaiden-test-'));
}

/**
 * Clean up temporary directory
 */
export async function cleanupTempDir(dirPath: string): Promise<void> {
  const { rm } = await import('node:fs/promises');
  await rm(dirPath, { recursive: true, force: true });
}

export { describe, it, expect };

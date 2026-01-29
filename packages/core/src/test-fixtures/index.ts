/**
 * Test fixtures for tests
 */

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const FIXTURES = {
  VALID_PRINCIPLE: join(__dirname, 'valid-principle.yaml'),
  INVALID_PRINCIPLE: join(__dirname, 'invalid-principle.yaml'),
  VALID_PERSONA: join(__dirname, 'valid-persona.yaml'),
  NESTED_DIR: join(__dirname, 'nested'),
  DEEP_NESTED_FILE: join(__dirname, 'nested', 'deep', 'nested-file.yaml'),
} as const;

export function getFixturePath(name: keyof typeof FIXTURES): string {
  return FIXTURES[name];
}

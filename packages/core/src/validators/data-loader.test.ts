import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { YamlDataLoader } from './data-loader.js';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createTempDir } from '../test-utils/index.js';

describe('YamlDataLoader', () => {
  let tempDir: string;
  let loader: YamlDataLoader;

  beforeEach(async () => {
    tempDir = await createTempDir();
    loader = new YamlDataLoader();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('loadFile', () => {
    it('should load valid YAML file', async () => {
      const filePath = join(tempDir, 'test.yaml');
      await writeFile(filePath, 'key: value\nnumber: 42');

      const result = await loader.loadFile(filePath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.filePath).toBe(filePath);
        expect(result.value.data).toEqual({ key: 'value', number: 42 });
      }
    });

    it('should handle .yml extension', async () => {
      const filePath = join(tempDir, 'test.yml');
      await writeFile(filePath, 'test: true');

      const result = await loader.loadFile(filePath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.data).toEqual({ test: true });
      }
    });

    it('should return error for invalid YAML', async () => {
      const filePath = join(tempDir, 'invalid.yaml');
      // Malformed YAML with unbalanced quotes
      await writeFile(filePath, 'key: "value without closing quote\nkey2: value');

      const result = await loader.loadFile(filePath);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('data-load-error');
        expect(result.error.filePath).toBe(filePath);
      }
    });

    it('should return error for non-existent file', async () => {
      const filePath = join(tempDir, 'does-not-exist.yaml');

      const result = await loader.loadFile(filePath);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('data-load-error');
      }
    });

    it('should handle empty YAML file', async () => {
      const filePath = join(tempDir, 'empty.yaml');
      await writeFile(filePath, '');

      const result = await loader.loadFile(filePath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.data).toBeNull();
      }
    });

    it('should handle complex YAML structures', async () => {
      const filePath = join(tempDir, 'complex.yaml');
      const complexYaml = `
meta:
  id: "test:123"
  version: "1.0.0"
  tags:
    - alpha
    - beta
data:
  nested:
    value: 42
    flag: true
`;
      await writeFile(filePath, complexYaml);

      const result = await loader.loadFile(filePath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.data).toHaveProperty('meta');
        expect(result.value.data).toHaveProperty('data');
      }
    });
  });

  describe('loadDirectory', () => {
    it('should load all YAML files in flat directory', async () => {
      await writeFile(join(tempDir, 'file1.yaml'), 'a: 1');
      await writeFile(join(tempDir, 'file2.yml'), 'b: 2');
      await writeFile(join(tempDir, 'file3.txt'), 'ignored');

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(2);
        const values = result.value.map(f => f.data);
        expect(values).toContainEqual({ a: 1 });
        expect(values).toContainEqual({ b: 2 });
      }
    });

    it('should recursively load nested directories', async () => {
      const nested = join(tempDir, 'nested', 'deep');
      await mkdir(nested, { recursive: true });

      await writeFile(join(tempDir, 'root.yaml'), 'level: 0');
      await writeFile(join(tempDir, 'nested', 'mid.yaml'), 'level: 1');
      await writeFile(join(nested, 'deep.yaml'), 'level: 2');

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(3);
      }
    });

    it('should stop on first invalid file', async () => {
      await writeFile(join(tempDir, 'valid.yaml'), 'ok: true');
      // Malformed YAML with unbalanced brackets
      await writeFile(join(tempDir, 'invalid.yaml'), 'bad: {key: [value, unclosed');

      const result = await loader.loadDirectory(tempDir);

      // Depends on file system order, but should fail
      expect(result.ok).toBe(false);
    });

    it('should handle directory with no YAML files', async () => {
      await writeFile(join(tempDir, 'readme.txt'), 'no yaml here');
      await writeFile(join(tempDir, 'data.json'), '{}');

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(0);
      }
    });

    it('should handle multiple nested levels with mixed content', async () => {
      // Create structure:
      // tempDir/
      //   a.yaml
      //   subdir1/
      //     b.yaml
      //     subdir2/
      //       c.yaml
      //       ignored.txt

      await mkdir(join(tempDir, 'subdir1', 'subdir2'), { recursive: true });
      await writeFile(join(tempDir, 'a.yaml'), 'file: a');
      await writeFile(join(tempDir, 'subdir1', 'b.yaml'), 'file: b');
      await writeFile(join(tempDir, 'subdir1', 'subdir2', 'c.yaml'), 'file: c');
      await writeFile(join(tempDir, 'subdir1', 'subdir2', 'ignored.txt'), 'text');

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(3);
      }
    });

    it('should preserve file paths in results', async () => {
      await writeFile(join(tempDir, 'test.yaml'), 'data: value');

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0].filePath).toContain('test.yaml');
        expect(result.value[0].filePath).toContain(tempDir);
      }
    });
  });
});

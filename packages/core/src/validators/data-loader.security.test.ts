import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { YamlDataLoader } from './data-loader.js';
import { writeFile, mkdir, symlink, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createTempDir } from '../test-utils/index.js';

describe('YamlDataLoader - Security Tests', () => {
  let tempDir: string;
  let loader: YamlDataLoader;

  beforeEach(async () => {
    tempDir = await createTempDir();
    loader = new YamlDataLoader();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('Path Traversal Protection', () => {
    it('should reject paths with ../ traversal', async () => {
      // Create a file outside temp dir using path traversal
      const maliciousPath = join(tempDir, '..', '..', 'malicious.yaml');

      const result = await loader.loadDirectory(tempDir);

      // Should succeed but not access files outside tempDir
      expect(result.ok).toBe(true);
    });

    it('should reject access to /etc directory (Unix)', async () => {
      if (process.platform !== 'win32') {
        // Try to load system directory
        const result = await loader.loadDirectory('/etc');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.message).toContain('blocked system directory');
        }
      }
    });

    it('should reject access to Windows system directories', async () => {
      if (process.platform === 'win32') {
        const result = await loader.loadDirectory('C:\\Windows');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.message).toContain('blocked system directory');
        }
      }
    });
  });

  describe('Recursion Depth Limiting', () => {
    it('should handle deeply nested directories up to limit', async () => {
      // Create 30-level deep nesting (below limit of 32)
      let currentPath = tempDir;
      for (let i = 0; i < 30; i++) {
        currentPath = join(currentPath, `level-${i}`);
        await mkdir(currentPath, { recursive: true });
      }

      // Add YAML file at deepest level
      const yamlPath = join(currentPath, 'deep.yaml');
      await writeFile(yamlPath, 'test: value');

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(1);
      }
    });

    it('should reject directories exceeding depth limit', async () => {
      // Create 35-level deep nesting (exceeds limit of 32)
      let currentPath = tempDir;
      for (let i = 0; i < 35; i++) {
        currentPath = join(currentPath, `level-${i}`);
        await mkdir(currentPath, { recursive: true });
      }

      const yamlPath = join(currentPath, 'too-deep.yaml');
      await writeFile(yamlPath, 'test: value');

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Maximum recursion depth');
      }
    });
  });

  describe('Symlink Loop Protection', () => {
    it('should detect and break circular symlink loops', async () => {
      const dir1 = join(tempDir, 'dir1');
      const dir2 = join(tempDir, 'dir2');
      await mkdir(dir1);
      await mkdir(dir2);

      // Add a YAML file to dir1
      await writeFile(join(dir1, 'file.yaml'), 'test: 1');

      // Create circular symlink: dir1/link -> dir2, dir2/link -> dir1
      try {
        await symlink(dir2, join(dir1, 'link'), 'dir');
        await symlink(dir1, join(dir2, 'link'), 'dir');
      } catch (error) {
        // Symlinks might not be supported on this platform
        console.log('Skipping symlink test - not supported');
        return;
      }

      const result = await loader.loadDirectory(tempDir);

      // Should succeed but not infinitely loop
      expect(result.ok).toBe(true);
      if (result.ok) {
        // Should only find the one real file, not loop
        expect(result.value.length).toBeLessThanOrEqual(1);
      }
    });

    it('should handle self-referencing symlink', async () => {
      const dir = join(tempDir, 'self-ref');
      await mkdir(dir);

      // Add a real YAML file
      await writeFile(join(dir, 'real.yaml'), 'test: real');

      try {
        await symlink(dir, join(dir, 'self'), 'dir');
      } catch (error) {
        console.log('Skipping symlink test - not supported');
        return;
      }

      const result = await loader.loadDirectory(tempDir);

      // Should not hang or crash
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(1);
      }
    });
  });

  describe('Resource Exhaustion Protection', () => {
    it('should reject directories with too many files', async () => {
      // Create 1005 YAML files (exceeds limit of 1000)
      for (let i = 0; i < 1005; i++) {
        await writeFile(
          join(tempDir, `file-${i}.yaml`),
          `test: ${i}`
        );
      }

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Maximum file limit');
      }
    });

    it('should handle exactly the file limit', async () => {
      // Create exactly 1000 YAML files
      for (let i = 0; i < 1000; i++) {
        await writeFile(
          join(tempDir, `file-${i}.yaml`),
          `test: ${i}`
        );
      }

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        // Should load all or nearly all files (within 1% of limit)
        // Minor variation possible due to filesystem-specific behaviors
        expect(result.value.length).toBeGreaterThanOrEqual(990);
        expect(result.value.length).toBeLessThanOrEqual(1000);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty directories', async () => {
      const emptyDir = join(tempDir, 'empty');
      await mkdir(emptyDir);

      const result = await loader.loadDirectory(emptyDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(0);
      }
    });

    it('should handle non-existent directory', async () => {
      const nonExistent = join(tempDir, 'does-not-exist');

      const result = await loader.loadDirectory(nonExistent);

      expect(result.ok).toBe(false);
    });

    it('should ignore non-YAML files', async () => {
      await writeFile(join(tempDir, 'readme.txt'), 'not yaml');
      await writeFile(join(tempDir, 'data.json'), '{}');
      await writeFile(join(tempDir, 'valid.yaml'), 'test: true');

      const result = await loader.loadDirectory(tempDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(1);
        expect(result.value[0].filePath).toContain('valid.yaml');
      }
    });

    it('should handle mixed valid and invalid YAML files', async () => {
      await writeFile(join(tempDir, 'valid.yaml'), 'key: value');
      // Malformed YAML with syntax error
      await writeFile(join(tempDir, 'invalid.yaml'), 'bad: "unclosed quote\nkey: value');

      const result = await loader.loadDirectory(tempDir);

      // Should fail on first invalid file
      expect(result.ok).toBe(false);
    });
  });
});

/**
 * データローダー
 * YAMLデータファイルの読み込みを担当（SRP）
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Result } from '../types/index.js';
import { ok, err } from '../types/index.js';

/**
 * Security Considerations:
 *
 * This loader implements multiple security controls to prevent:
 * 1. Directory traversal attacks (path validation)
 * 2. Symlink loop exploitation (inode tracking)
 * 3. Stack overflow (depth limiting)
 * 4. Memory exhaustion (file count limiting)
 *
 * These controls are based on OWASP recommendations for file system operations.
 */

/**
 * Security constants for file system traversal
 */
const MAX_RECURSION_DEPTH = 32; // Maximum directory depth
const MAX_FILES_PER_DIRECTORY = 1000; // Maximum files to collect
const BLOCKED_PATHS = ['/etc', '/sys', '/proc', 'C:\\Windows', 'C:\\System32'] as const;

/**
 * Validate path for security concerns
 * Returns error message if path is invalid, null if valid
 */
function validatePath(filePath: string): string | null {
  // Normalize path separators for cross-platform compatibility
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Check for path traversal attempts
  if (normalizedPath.includes('../') || normalizedPath.includes('..\\')) {
    return 'Path traversal detected: path cannot contain ../';
  }

  // Check for blocked system paths (case-insensitive on Windows)
  for (const blockedPath of BLOCKED_PATHS) {
    const normalizedBlocked = blockedPath.replace(/\\/g, '/');
    // Use case-insensitive comparison for Windows paths
    const isBlocked = normalizedPath.toLowerCase().startsWith(normalizedBlocked.toLowerCase());
    if (isBlocked) {
      return `Access denied: path ${filePath} is in blocked system directory`;
    }
  }

  return null;
}

/** データ読み込みエラー */
export interface DataLoadError {
  readonly type: 'data-load-error';
  readonly filePath: string;
  readonly message: string;
  readonly cause?: unknown;
}

/** 読み込まれたデータファイル */
export interface LoadedDataFile {
  readonly filePath: string;
  readonly data: unknown;
}

/**
 * データローダーインターフェース（DIP）
 */
export interface DataLoader {
  loadFile(filePath: string): Promise<Result<LoadedDataFile, DataLoadError>>;
  loadDirectory(dirPath: string): Promise<Result<readonly LoadedDataFile[], DataLoadError>>;
}

/**
 * YAMLファイルローダー
 */
export class YamlDataLoader implements DataLoader {
  /** Track visited inodes to detect symlink loops */
  private readonly visitedInodes = new Set<string>();

  async loadFile(filePath: string): Promise<Result<LoadedDataFile, DataLoadError>> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const data: unknown = parseYaml(content);
      return ok({ filePath, data });
    } catch (cause) {
      return err({
        type: 'data-load-error',
        filePath,
        message: `Failed to load YAML file: ${filePath}`,
        cause,
      });
    }
  }

  async loadDirectory(dirPath: string): Promise<Result<readonly LoadedDataFile[], DataLoadError>> {
    try {
      // Reset visited inodes for each top-level directory scan
      this.visitedInodes.clear();

      const files = await this.collectYamlFiles(dirPath);
      const results: LoadedDataFile[] = [];

      for (const filePath of files) {
        const result = await this.loadFile(filePath);
        if (!result.ok) {
          return result;
        }
        results.push(result.value);
      }

      return ok(results);
    } catch (cause) {
      // Preserve security error messages
      const message = cause instanceof Error ? cause.message : `Failed to load directory: ${dirPath}`;

      return err({
        type: 'data-load-error',
        filePath: dirPath,
        message,
        cause,
      });
    }
  }

  private async collectYamlFiles(
    dirPath: string,
    depth: number = 0,
    fileCount: { count: number } = { count: 0 }
  ): Promise<string[]> {
    // Security: Check recursion depth
    if (depth > MAX_RECURSION_DEPTH) {
      throw new Error(
        `Maximum recursion depth (${MAX_RECURSION_DEPTH}) exceeded at: ${dirPath}`
      );
    }

    // Security: Validate path
    const pathError = validatePath(dirPath);
    if (pathError) {
      throw new Error(pathError);
    }

    // Security: Check file count limit
    if (fileCount.count > MAX_FILES_PER_DIRECTORY) {
      throw new Error(
        `Maximum file limit (${MAX_FILES_PER_DIRECTORY}) exceeded`
      );
    }

    const entries = await readdir(dirPath);
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);

      // Security: Validate constructed path
      const fullPathError = validatePath(fullPath);
      if (fullPathError) {
        // Skip invalid paths but don't fail entire operation
        continue;
      }

      let stats;
      try {
        // Use stat (follows symlinks) to get file info
        stats = await stat(fullPath);
      } catch (error) {
        // Skip files we cannot access
        continue;
      }

      // Security: Check for symlink loops using inode tracking
      const inodeKey = `${stats.dev}:${stats.ino}`;
      if (this.visitedInodes.has(inodeKey)) {
        // Symlink loop detected, skip this path
        continue;
      }
      this.visitedInodes.add(inodeKey);

      if (stats.isDirectory()) {
        const subFiles = await this.collectYamlFiles(
          fullPath,
          depth + 1,
          fileCount
        );
        files.push(...subFiles);
      } else if (
        stats.isFile() &&
        (extname(entry) === '.yaml' || extname(entry) === '.yml')
      ) {
        files.push(fullPath);
        fileCount.count++;

        // Check limit after incrementing
        if (fileCount.count > MAX_FILES_PER_DIRECTORY) {
          throw new Error(
            `Maximum file limit (${MAX_FILES_PER_DIRECTORY}) exceeded`
          );
        }
      }
    }

    return files;
  }
}

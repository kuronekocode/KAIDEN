/**
 * データローダー
 * YAMLデータファイルの読み込みを担当（SRP）
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Result } from '../types/index.js';
import { ok, err } from '../types/index.js';

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
      return err({
        type: 'data-load-error',
        filePath: dirPath,
        message: `Failed to load directory: ${dirPath}`,
        cause,
      });
    }
  }

  private async collectYamlFiles(dirPath: string): Promise<string[]> {
    const entries = await readdir(dirPath);
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        const subFiles = await this.collectYamlFiles(fullPath);
        files.push(...subFiles);
      } else if (stats.isFile() && (extname(entry) === '.yaml' || extname(entry) === '.yml')) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

/**
 * スキーマローダー
 * JSON Schemaファイルの読み込みを担当（SRP）
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Result } from '../types/index.js';
import { ok, err } from '../types/index.js';

/** スキーマの種類 */
export type SchemaType = 'principle' | 'persona' | 'mcp';

/** スキーマ読み込みエラー */
export interface SchemaLoadError {
  readonly type: 'schema-load-error';
  readonly schemaType: SchemaType;
  readonly message: string;
  readonly cause?: unknown;
}

/**
 * スキーマローダーインターフェース（DIP）
 */
export interface SchemaLoader {
  load(schemaType: SchemaType): Promise<Result<unknown, SchemaLoadError>>;
}

/**
 * ファイルシステムベースのスキーマローダー
 */
export class FileSystemSchemaLoader implements SchemaLoader {
  constructor(private readonly schemasDir: string) {}

  async load(schemaType: SchemaType): Promise<Result<unknown, SchemaLoadError>> {
    const filePath = join(this.schemasDir, `${schemaType}.schema.json`);

    try {
      const content = await readFile(filePath, 'utf-8');
      const schema: unknown = JSON.parse(content);
      return ok(schema);
    } catch (cause) {
      return err({
        type: 'schema-load-error',
        schemaType,
        message: `Failed to load schema: ${filePath}`,
        cause,
      });
    }
  }
}

/**
 * デフォルトのスキーマディレクトリパスを取得
 */
export function getDefaultSchemasDir(): string {
  // パッケージルートからの相対パス
  return join(process.cwd(), 'data', 'schemas');
}

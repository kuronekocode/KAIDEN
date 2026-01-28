/**
 * バリデーターのエクスポート
 */

// スキーマローダー
export type { SchemaType, SchemaLoadError, SchemaLoader } from './schema-loader.js';
export { FileSystemSchemaLoader, getDefaultSchemasDir } from './schema-loader.js';

// データローダー
export type { DataLoadError, LoadedDataFile, DataLoader } from './data-loader.js';
export { YamlDataLoader } from './data-loader.js';

// スキーマバリデーター
export type { ValidationError, ValidationSuccess, SchemaValidator } from './schema-validator.js';
export { AjvSchemaValidator } from './schema-validator.js';

// データバリデーター
export type { DataValidationResult, ValidateDirectoryOptions, DataValidator } from './data-validator.js';
export { IntegratedDataValidator } from './data-validator.js';

// ファクトリ関数
import { FileSystemSchemaLoader, getDefaultSchemasDir } from './schema-loader.js';
import { YamlDataLoader } from './data-loader.js';
import { AjvSchemaValidator } from './schema-validator.js';
import { IntegratedDataValidator } from './data-validator.js';

/**
 * デフォルト設定でDataValidatorを作成
 */
export function createDataValidator(schemasDir?: string): IntegratedDataValidator {
  const schemaLoader = new FileSystemSchemaLoader(schemasDir ?? getDefaultSchemasDir());
  const dataLoader = new YamlDataLoader();
  const schemaValidator = new AjvSchemaValidator(schemaLoader);
  return new IntegratedDataValidator(dataLoader, schemaValidator);
}

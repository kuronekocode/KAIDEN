/**
 * データバリデーター
 * 複数のデータファイルをまとめて検証（SRP）
 */

import type { Result } from '../types/index.js';
import { ok, err } from '../types/index.js';
import type { SchemaType } from './schema-loader.js';
import type { DataLoader, LoadedDataFile } from './data-loader.js';
import type { SchemaValidator, ValidationError, ValidationSuccess } from './schema-validator.js';

/** バリデーション結果 */
export interface DataValidationResult<T> {
  readonly valid: readonly ValidationSuccess<T>[];
  readonly invalid: readonly ValidationError[];
}

/** ディレクトリ検証オプション */
export interface ValidateDirectoryOptions {
  readonly schemaType: SchemaType;
  readonly directory: string;
}

/**
 * データバリデーターインターフェース（DIP）
 */
export interface DataValidator {
  validateFile<T>(
    schemaType: SchemaType,
    filePath: string
  ): Promise<Result<ValidationSuccess<T>, ValidationError>>;

  validateDirectory<T>(
    options: ValidateDirectoryOptions
  ): Promise<Result<DataValidationResult<T>, { message: string }>>;
}

/**
 * 統合データバリデーター
 * DataLoaderとSchemaValidatorを組み合わせて使用
 */
export class IntegratedDataValidator implements DataValidator {
  constructor(
    private readonly dataLoader: DataLoader,
    private readonly schemaValidator: SchemaValidator
  ) {}

  async validateFile<T>(
    schemaType: SchemaType,
    filePath: string
  ): Promise<Result<ValidationSuccess<T>, ValidationError>> {
    const loadResult = await this.dataLoader.loadFile(filePath);

    if (!loadResult.ok) {
      return err({
        type: 'validation-error',
        filePath,
        schemaType,
        errors: [loadResult.error.message],
      });
    }

    return this.schemaValidator.validate<T>(
      schemaType,
      loadResult.value.data,
      filePath
    );
  }

  async validateDirectory<T>(
    options: ValidateDirectoryOptions
  ): Promise<Result<DataValidationResult<T>, { message: string }>> {
    const { schemaType, directory } = options;

    const loadResult = await this.dataLoader.loadDirectory(directory);

    if (!loadResult.ok) {
      return err({ message: loadResult.error.message });
    }

    const valid: ValidationSuccess<T>[] = [];
    const invalid: ValidationError[] = [];

    for (const file of loadResult.value) {
      const result = await this.schemaValidator.validate<T>(
        schemaType,
        file.data,
        file.filePath
      );

      if (result.ok) {
        valid.push(result.value);
      } else {
        invalid.push(result.error);
      }
    }

    return ok({ valid, invalid });
  }
}

/**
 * スキーマバリデーター
 * JSON Schemaによるデータ検証を担当（SRP）
 */

import type { Result } from '../types/index.js';
import { ok, err } from '../types/index.js';
import type { SchemaType, SchemaLoader } from './schema-loader.js';

/** バリデーションエラー */
export interface ValidationError {
  readonly type: 'validation-error';
  readonly filePath?: string;
  readonly schemaType: SchemaType;
  readonly errors: readonly string[];
}

/** バリデーション成功結果 */
export interface ValidationSuccess<T> {
  readonly data: T;
  readonly filePath?: string;
}

/**
 * スキーマバリデーターインターフェース（DIP）
 */
export interface SchemaValidator {
  validate<T>(
    schemaType: SchemaType,
    data: unknown,
    filePath?: string
  ): Promise<Result<ValidationSuccess<T>, ValidationError>>;
}

/**
 * AJVベースのスキーマバリデーター
 */
export class AjvSchemaValidator implements SchemaValidator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ajv: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly compiledValidators: Map<SchemaType, any> = new Map();

  constructor(private readonly schemaLoader: SchemaLoader) {}

  private async ensureAjv(): Promise<void> {
    if (this.ajv) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ajv2020Module = await import('ajv/dist/2020.js') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addFormatsModule = await import('ajv-formats') as any;

    const Ajv2020 = Ajv2020Module.default ?? Ajv2020Module;
    const addFormats = addFormatsModule.default ?? addFormatsModule;

    this.ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  async validate<T>(
    schemaType: SchemaType,
    data: unknown,
    filePath?: string
  ): Promise<Result<ValidationSuccess<T>, ValidationError>> {
    const validator = await this.getValidator(schemaType);

    if (!validator.ok) {
      const errorResult: ValidationError = {
        type: 'validation-error',
        filePath,
        schemaType,
        errors: [validator.error.message],
      };
      return err(errorResult);
    }

    const isValid = validator.value(data);

    if (!isValid) {
      const errors = (validator.value.errors ?? []).map(
        (e: { instancePath: string; message?: string }) =>
          `${e.instancePath || '/'}: ${e.message ?? 'Unknown error'}`
      );
      const errorResult: ValidationError = {
        type: 'validation-error',
        filePath,
        schemaType,
        errors,
      };
      return err(errorResult);
    }

    const successResult: ValidationSuccess<T> = {
      data: data as T,
      filePath,
    };
    return ok(successResult);
  }

  private async getValidator(
    schemaType: SchemaType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Result<any, { message: string }>> {
    const cached = this.compiledValidators.get(schemaType);
    if (cached) {
      return ok(cached);
    }

    await this.ensureAjv();

    const schemaResult = await this.schemaLoader.load(schemaType);
    if (!schemaResult.ok) {
      return err({ message: schemaResult.error.message });
    }

    try {
      // スキーマの$idを削除してコンパイル時の重複を防ぐ
      const schema = { ...(schemaResult.value as Record<string, unknown>) };
      delete schema['$id'];

      const validator = this.ajv.compile(schema);
      this.compiledValidators.set(schemaType, validator);
      return ok(validator);
    } catch (cause) {
      return err({
        message: `Failed to compile schema for ${schemaType}: ${cause instanceof Error ? cause.message : String(cause)}`,
      });
    }
  }
}

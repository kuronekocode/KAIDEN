/**
 * テンプレートエンジン
 * シンプルなテンプレート処理を担当（SRP）
 */

/** テンプレートコンテキスト */
export interface TemplateContext {
  readonly [key: string]: unknown;
}

/**
 * テンプレートエンジンインターフェース（DIP）
 */
export interface TemplateEngine {
  render(template: string, context: TemplateContext): string;
}

/**
 * シンプルテンプレートエンジン
 * {{変数}} 形式のプレースホルダを置換
 */
export class SimpleTemplateEngine implements TemplateEngine {
  render(template: string, context: TemplateContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
      const trimmedKey = key.trim();
      const value = this.getValue(context, trimmedKey);
      return value !== undefined ? String(value) : '';
    });
  }

  private getValue(context: TemplateContext, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = context;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }
}

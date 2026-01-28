/**
 * 共通の型定義
 * すべてのデータ型で使用される基本的な型を定義
 */

/** 言語コード */
export type Lang = 'ja' | 'en';

/** 重要度レベル */
export type Severity = 'low' | 'medium' | 'high';

/** 詳細度 */
export type Verbosity = 'minimal' | 'standard' | 'detailed';

/** トーン */
export type Tone = 'friendly' | 'neutral' | 'analytical';

/** 原則カテゴリ */
export type PrincipleCategory =
  | 'object-oriented-design'
  | 'functional-design'
  | 'architecture'
  | 'coding-practice'
  | 'testing'
  | 'security';

/** MCPカテゴリ */
export type MCPCategory =
  | 'system'
  | 'web'
  | 'database'
  | 'ai'
  | 'productivity'
  | 'development';

/**
 * 結果型（Railway Oriented Programming）
 * 成功または失敗を表現
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** 成功結果を作成 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** 失敗結果を作成 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

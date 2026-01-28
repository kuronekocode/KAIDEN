/**
 * ペルソナ（Persona）の型定義
 */

import type { Lang, Verbosity, Tone } from './common.js';

/** ペルソナのメタデータ */
export interface PersonaMeta {
  readonly id: string;
  readonly version: string;
  readonly lang: Lang;
  readonly changelog?: readonly ChangelogEntry[];
}

/** 変更履歴エントリ */
export interface ChangelogEntry {
  readonly version: string;
  readonly date: string;
  readonly changes: readonly string[];
}

/** 原則のデフォルト設定 */
export interface PrincipleDefault {
  readonly id: string;
  readonly enabled: boolean;
  readonly weight?: number;
}

/** スタイル設定 */
export interface Style {
  readonly verbosity?: Verbosity;
  readonly tone?: Tone;
  readonly focusAreas?: readonly string[];
}

/** デフォルト設定 */
export interface Defaults {
  readonly principles?: readonly PrincipleDefault[];
  readonly style?: Style;
}

/** 依存関係 */
export interface Dependencies {
  readonly principles?: Readonly<Record<string, string>>;
}

/** ペルソナデータ */
export interface PersonaData {
  readonly name: string;
  readonly description: string;
  readonly icon?: string;
  readonly defaults: Defaults;
  readonly dependencies?: Dependencies;
}

/** ペルソナファイル全体 */
export interface PersonaFile {
  readonly $schema?: string;
  readonly meta: PersonaMeta;
  readonly persona: PersonaData;
}

/**
 * 原則（Principle）の型定義
 */

import type { Lang, PrincipleCategory, Severity } from './common.js';

/** 原則のメタデータ */
export interface PrincipleMeta {
  readonly id: string;
  readonly version: string;
  readonly lang: Lang;
  readonly license: string;
  readonly lastUpdated: string;
}

/** 子原則（階層構造の子要素） */
export interface ChildPrinciple {
  readonly id: string;
  readonly name: string;
  readonly nameJa?: string;
  readonly description?: string;
  readonly promptFragment: string;
}

/** 他の原則との緊張関係 */
export interface Tension {
  readonly with: string;
  readonly description: string;
  readonly severity: Severity;
}

/** ペルソナへの推奨度 */
export interface PersonaRecommendation {
  readonly persona: string;
  readonly weight: number;
}

/** 参考文献 */
export interface Reference {
  readonly title: string;
  readonly url: string;
  readonly author?: string;
  readonly year?: number;
}

/** 原則データ */
export interface PrincipleData {
  readonly name: string;
  readonly nameJa?: string;
  readonly category: PrincipleCategory;
  readonly summary: string;
  readonly description?: string;
  readonly triggerTokens?: readonly string[];
  readonly promptFragment?: string;
  readonly children?: readonly ChildPrinciple[];
  readonly tensions?: readonly Tension[];
  readonly recommendedFor?: readonly PersonaRecommendation[];
  readonly references?: readonly Reference[];
}

/** 原則ファイル全体 */
export interface PrincipleFile {
  readonly $schema?: string;
  readonly meta: PrincipleMeta;
  readonly principle: PrincipleData;
}

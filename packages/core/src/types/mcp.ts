/**
 * MCP（Model Context Protocol）の型定義
 */

import type { MCPCategory } from './common.js';

/** MCPのメタデータ */
export interface MCPMeta {
  readonly id: string;
  readonly version: string;
  readonly sourceUrl: string;
  readonly lastChecked: string;
  readonly checksum?: string;
}

/** 環境変数定義 */
export interface EnvVariable {
  readonly name: string;
  readonly description: string;
  readonly required?: boolean;
  readonly sensitive?: boolean;
}

/** 設定変数定義 */
export interface ConfigVariable {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly default?: string;
}

/** セットアップ情報 */
export interface Setup {
  readonly authRequired?: boolean;
  readonly envVariables?: readonly EnvVariable[];
  readonly configTemplate?: string;
  readonly variables?: readonly ConfigVariable[];
}

/** リンク集 */
export interface Links {
  readonly docs?: string;
  readonly npm?: string;
  readonly github?: string;
  readonly changelog?: string;
  readonly auth?: string;
}

/** ツール定義 */
export interface Tool {
  readonly name: string;
  readonly description: string;
}

/** MCPデータ */
export interface MCPData {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly category: MCPCategory;
  readonly setup?: Setup;
  readonly links?: Links;
  readonly tools?: readonly Tool[];
}

/** MCPファイル全体 */
export interface MCPFile {
  readonly $schema?: string;
  readonly meta: MCPMeta;
  readonly mcp: MCPData;
}

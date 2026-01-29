/**
 * 型定義のエクスポート
 */

// 共通型
export type {
  Lang,
  Severity,
  Verbosity,
  Tone,
  PrincipleCategory,
  MCPCategory,
  Result,
} from './common.js';

export { ok, err } from './common.js';

// 原則型
export type {
  PrincipleMeta,
  ChildPrinciple,
  Tension,
  PersonaRecommendation,
  Reference,
  PrincipleData,
  PrincipleFile,
} from './principle.js';

// ペルソナ型
export type {
  PersonaMeta,
  ChangelogEntry,
  PrincipleDefault,
  Style,
  Defaults,
  Dependencies,
  PersonaData,
  PersonaFile,
} from './persona.js';

// MCP型
export type {
  MCPMeta,
  EnvVariable,
  ConfigVariable,
  Setup,
  Links,
  Tool,
  MCPData,
  MCPFile,
} from './mcp.js';

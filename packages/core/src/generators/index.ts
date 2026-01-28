/**
 * ジェネレーターのエクスポート
 */

export type { TemplateContext, TemplateEngine } from './template-engine.js';
export { SimpleTemplateEngine } from './template-engine.js';

export type { SectionBuilder } from './section-builder.js';
export {
  HeaderSectionBuilder,
  PrincipleSectionBuilder,
  StyleSectionBuilder,
  FooterSectionBuilder,
} from './section-builder.js';

export type { GenerateOptions, GenerateResult, AgentsGenerator } from './agents-generator.js';
export { DefaultAgentsGenerator } from './agents-generator.js';

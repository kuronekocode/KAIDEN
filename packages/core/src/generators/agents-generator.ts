/**
 * AGENTS.mdジェネレーター
 * 各セクションを組み合わせてAGENTS.mdを生成（SRP）
 */

import type { PersonaFile } from '../types/index.js';
import type { ResolvedPrinciple } from '../resolvers/index.js';
import {
  HeaderSectionBuilder,
  PrincipleSectionBuilder,
  StyleSectionBuilder,
  FooterSectionBuilder,
  type SectionBuilder,
} from './section-builder.js';

/** 生成オプション */
export interface GenerateOptions {
  readonly persona: PersonaFile;
  readonly principles: readonly ResolvedPrinciple[];
  readonly projectName?: string;
  readonly includeFooter?: boolean;
}

/** 生成結果 */
export interface GenerateResult {
  readonly content: string;
  readonly meta: {
    readonly personaId: string;
    readonly personaVersion: string;
    readonly principleCount: number;
    readonly generatedAt: string;
  };
}

/**
 * AGENTS.mdジェネレーターインターフェース（DIP）
 */
export interface AgentsGenerator {
  generate(options: GenerateOptions): GenerateResult;
}

/**
 * デフォルトAGENTS.mdジェネレーター
 */
export class DefaultAgentsGenerator implements AgentsGenerator {
  generate(options: GenerateOptions): GenerateResult {
    const { persona, principles, projectName, includeFooter = true } = options;

    const builders: SectionBuilder[] = [
      new HeaderSectionBuilder(persona, projectName),
      new PrincipleSectionBuilder(principles),
      new StyleSectionBuilder(persona),
    ];

    if (includeFooter) {
      builders.push(new FooterSectionBuilder());
    }

    const sections = builders.map((builder) => builder.build()).filter((s) => s.length > 0);
    const content = sections.join('\n');

    return {
      content,
      meta: {
        personaId: persona.meta.id,
        personaVersion: persona.meta.version,
        principleCount: principles.filter((p) => p.enabled).length,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

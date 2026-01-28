/**
 * セクションビルダー
 * AGENTS.mdの各セクションを構築（SRP）
 */

import type { PrincipleFile, PersonaFile, ChildPrinciple, Tension } from '../types/index.js';
import type { ResolvedPrinciple } from '../resolvers/index.js';

/**
 * セクションビルダーインターフェース（ISP）
 * 各セクションごとに分離可能
 */
export interface SectionBuilder {
  build(): string;
}

/**
 * ヘッダーセクションビルダー
 */
export class HeaderSectionBuilder implements SectionBuilder {
  constructor(
    private readonly persona: PersonaFile,
    private readonly projectName?: string
  ) {}

  build(): string {
    const lines: string[] = [];
    const name = this.projectName ?? 'プロジェクト';

    lines.push(`# ${name} - AGENTS.md`);
    lines.push('');
    lines.push('## 設計哲学');
    lines.push('');
    lines.push(this.persona.persona.description.trim());
    lines.push('');

    return lines.join('\n');
  }
}

/**
 * 原則セクションビルダー
 */
export class PrincipleSectionBuilder implements SectionBuilder {
  constructor(private readonly principles: readonly ResolvedPrinciple[]) {}

  build(): string {
    const enabledPrinciples = this.principles.filter((p) => p.enabled);

    if (enabledPrinciples.length === 0) {
      return '';
    }

    const lines: string[] = [];

    lines.push('## 設計原則');
    lines.push('');

    // 原則の概要
    const principleNames = enabledPrinciples.map((p) => {
      const trigger = p.data.principle.triggerTokens?.[0] ?? p.data.principle.name;
      return trigger;
    });
    lines.push(`${principleNames.join('、')}で設計すること。`);
    lines.push('');

    // 各原則の詳細
    for (const resolved of enabledPrinciples) {
      const principle = resolved.data.principle;
      const displayName = principle.nameJa ?? principle.name;

      lines.push(`### ${principle.name}（${displayName}）`);
      lines.push('');

      if (principle.promptFragment) {
        lines.push(principle.promptFragment);
        lines.push('');
      }

      // 子原則
      if (principle.children && principle.children.length > 0) {
        for (const child of principle.children) {
          lines.push(this.formatChildPrinciple(child));
        }
        lines.push('');
      }

      // 緊張関係の警告
      const tensions = this.getRelevantTensions(resolved, enabledPrinciples);
      if (tensions.length > 0) {
        lines.push('**注意点:**');
        for (const tension of tensions) {
          // 改行を含む説明をスペースで結合して1行にまとめる
          const desc = tension.description
            .trim()
            .split('\n')
            .map((line) => line.trim())
            .join(' ');
          lines.push(`- ${desc}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private formatChildPrinciple(child: ChildPrinciple): string {
    const name = child.nameJa ? `${child.name}（${child.nameJa}）` : child.name;
    return `- **${name}**: ${child.promptFragment}`;
  }

  private getRelevantTensions(
    current: ResolvedPrinciple,
    allEnabled: readonly ResolvedPrinciple[]
  ): readonly Tension[] {
    const tensions = current.data.principle.tensions ?? [];
    const enabledIds = new Set(allEnabled.map((p) => p.id));

    return tensions.filter((t) => enabledIds.has(t.with));
  }
}

/**
 * スタイルセクションビルダー
 */
export class StyleSectionBuilder implements SectionBuilder {
  constructor(private readonly persona: PersonaFile) {}

  build(): string {
    const style = this.persona.persona.defaults.style;

    if (!style) {
      return '';
    }

    const lines: string[] = [];

    lines.push('## スタイル');
    lines.push('');

    if (style.verbosity) {
      const verbosityMap = {
        minimal: '簡潔',
        standard: '標準',
        detailed: '詳細',
      };
      lines.push(`- **詳細度**: ${verbosityMap[style.verbosity]}`);
    }

    if (style.tone) {
      const toneMap = {
        friendly: 'フレンドリー',
        neutral: '中立的',
        analytical: '分析的',
      };
      lines.push(`- **トーン**: ${toneMap[style.tone]}`);
    }

    if (style.focusAreas && style.focusAreas.length > 0) {
      lines.push(`- **重点領域**: ${style.focusAreas.join(', ')}`);
    }

    lines.push('');

    return lines.join('\n');
  }
}

/**
 * フッターセクションビルダー
 */
export class FooterSectionBuilder implements SectionBuilder {
  build(): string {
    const lines: string[] = [];

    lines.push('## このプロジェクト固有の設定');
    lines.push('');
    lines.push('<!-- ここにプロジェクト固有の設定を追記してください -->');
    lines.push('');

    return lines.join('\n');
  }
}

/**
 * ジェネレーター状態管理（Svelte 5 runes）
 */

import type { PersonaFile, PrincipleFile } from '@kaiden/core';

/**
 * Weight thresholds for principle importance classification
 */
const DEFAULT_PRINCIPLE_WEIGHT = 0.5 as const;
const HIGH_WEIGHT_THRESHOLD = 0.8 as const;
const MEDIUM_WEIGHT_THRESHOLD = 0.5 as const;

/**
 * Classify principle weight into display label
 */
function getWeightLabel(weight: number): '高' | '中' | '低' {
  if (weight >= HIGH_WEIGHT_THRESHOLD) return '高';
  if (weight >= MEDIUM_WEIGHT_THRESHOLD) return '中';
  return '低';
}

/** 原則の有効/無効状態 */
export interface PrincipleState {
  readonly id: string;
  enabled: boolean;
  weight: number;
}

/** ジェネレーター状態 */
export interface GeneratorState {
  selectedPersonaId: string | null;
  principleStates: Map<string, PrincipleState>;
  projectName: string;
  previewContent: string;
}

/** 初期状態を作成 */
export function createInitialState(): GeneratorState {
  return {
    selectedPersonaId: null,
    principleStates: new Map(),
    projectName: '',
    previewContent: '',
  };
}

/** ペルソナからデフォルトの原則状態を生成 */
export function createPrincipleStatesFromPersona(
  persona: PersonaFile,
  allPrinciples: readonly PrincipleFile[]
): Map<string, PrincipleState> {
  const states = new Map<string, PrincipleState>();
  
  // すべての原則をデフォルトで disabled に
  for (const principle of allPrinciples) {
    states.set(principle.meta.id, {
      id: principle.meta.id,
      enabled: false,
      weight: DEFAULT_PRINCIPLE_WEIGHT,
    });
  }
  
  // ペルソナのデフォルト設定を適用
  for (const defaultPrinciple of persona.persona.defaults.principles ?? []) {
    const existing = states.get(defaultPrinciple.id);
    if (existing) {
      states.set(defaultPrinciple.id, {
        id: defaultPrinciple.id,
        enabled: defaultPrinciple.enabled,
        weight: defaultPrinciple.weight ?? DEFAULT_PRINCIPLE_WEIGHT,
      });
    }
  }
  
  return states;
}

/** AGENTS.md コンテンツを生成 */
export function generateAgentsMd(
  state: GeneratorState,
  personas: readonly PersonaFile[],
  principles: readonly PrincipleFile[]
): string {
  const persona = personas.find(p => p.meta.id === state.selectedPersonaId);
  if (!persona) {
    return '# AGENTS.md\n\nペルソナを選択してください。';
  }
  
  const enabledPrinciples = principles.filter(p => {
    const pState = state.principleStates.get(p.meta.id);
    return pState?.enabled;
  });
  
  // ヘッダー
  let content = '# AGENTS.md\n\n';
  
  // プロジェクト情報
  if (state.projectName) {
    content += `## プロジェクト: ${state.projectName}\n\n`;
  }
  
  // ペルソナ情報
  content += `## ペルソナ: ${persona.persona.name}\n\n`;
  content += `${persona.persona.description}\n\n`;
  
  // 設計原則
  if (enabledPrinciples.length > 0) {
    content += '## 設計原則\n\n';
    
    for (const principle of enabledPrinciples) {
      const pState = state.principleStates.get(principle.meta.id)!;
      const weightLabel = getWeightLabel(pState.weight);

      content += `### ${principle.principle.name}`;
      if (principle.principle.nameJa) {
        content += ` (${principle.principle.nameJa})`;
      }
      content += ` [重要度: ${weightLabel}]\n\n`;
      
      content += `${principle.principle.summary}\n\n`;
      
      // 子原則
      if (principle.principle.children && principle.principle.children.length > 0) {
        content += '詳細:\n';
        for (const child of principle.principle.children) {
          content += `- **${child.name}**: ${child.promptFragment}\n`;
        }
        content += '\n';
      }
      
      // プロンプトフラグメント
      if (principle.principle.promptFragment) {
        content += `> ${principle.principle.promptFragment}\n\n`;
      }
    }
  }
  
  // スタイル設定
  const style = persona.persona.defaults.style;
  if (style) {
    content += '## スタイル\n\n';
    
    if (style.verbosity) {
      const verbosityLabel = style.verbosity === 'minimal' ? '簡潔' : 
                            style.verbosity === 'detailed' ? '詳細' : '標準';
      content += `- 出力詳細度: ${verbosityLabel}\n`;
    }
    
    if (style.tone) {
      const toneLabel = style.tone === 'friendly' ? 'フレンドリー' :
                       style.tone === 'analytical' ? '分析的' : style.tone;
      content += `- トーン: ${toneLabel}\n`;
    }
    
    if (style.focusAreas && style.focusAreas.length > 0) {
      content += `- 重点領域: ${style.focusAreas.join(', ')}\n`;
    }
    
    content += '\n';
  }
  
  // 緊張関係
  const tensionMap = new Map<string, Array<{ with: string; description: string; severity: string }>>();
  
  for (const principle of enabledPrinciples) {
    if (principle.principle.tensions) {
      for (const tension of principle.principle.tensions) {
        const otherPrinciple = enabledPrinciples.find(p => p.meta.id === tension.with);
        if (otherPrinciple) {
          const key = [principle.meta.id, tension.with].sort().join('-');
          if (!tensionMap.has(key)) {
            tensionMap.set(key, [{
              with: tension.with,
              description: tension.description,
              severity: tension.severity,
            }]);
          }
        }
      }
    }
  }
  
  if (tensionMap.size > 0) {
    content += '## ⚠️ 緊張関係\n\n';
    content += '選択した原則間には以下の緊張関係があります。バランスを考慮してください。\n\n';
    
    for (const tensions of tensionMap.values()) {
      for (const tension of tensions) {
        const severityEmoji = tension.severity === 'high' ? '🔴' :
                              tension.severity === 'medium' ? '🟡' : '🟢';
        content += `${severityEmoji} ${tension.description.trim()}\n\n`;
      }
    }
  }
  
  // フッター
  content += '---\n\n';
  content += `*Generated by [kaiden](https://github.com/kuronekocode/kaiden) at ${new Date().toISOString()}*\n`;
  
  return content;
}

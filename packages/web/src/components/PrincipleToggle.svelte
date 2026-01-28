<script lang="ts">
  import type { PrincipleFile } from '@kaiden/core';
  import type { PrincipleState } from '../stores/generator';
  
  interface Props {
    principles: PrincipleFile[];
    states: Map<string, PrincipleState>;
    onToggle: (id: string, enabled: boolean) => void;
    onWeightChange: (id: string, weight: number) => void;
  }
  
  let { principles, states, onToggle, onWeightChange }: Props = $props();
  
  function getState(id: string): PrincipleState {
    return states.get(id) ?? { id, enabled: false, weight: 0.5 };
  }
  
  function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'object-oriented-design': 'オブジェクト指向設計',
      'functional-design': '関数型設計',
      'architecture': 'アーキテクチャ',
      'coding-practice': 'コーディング実践',
      'testing': 'テスト',
      'security': 'セキュリティ',
    };
    return labels[category] ?? category;
  }
</script>

<div class="principle-toggle">
  <h2 class="toggle-title">📋 原則を調整</h2>
  <p class="toggle-description">有効にする原則と重要度を設定してください</p>
  
  <div class="principle-list">
    {#each principles as principle (principle.meta.id)}
      {@const state = getState(principle.meta.id)}
      <div class="principle-item" class:enabled={state.enabled}>
        <div class="principle-header">
          <label class="principle-checkbox">
            <input
              type="checkbox"
              checked={state.enabled}
              onchange={(e) => onToggle(principle.meta.id, e.currentTarget.checked)}
            />
            <span class="checkmark"></span>
          </label>
          
          <div class="principle-info">
            <h3 class="principle-name">
              {principle.principle.name}
              {#if principle.principle.nameJa}
                <span class="name-ja">({principle.principle.nameJa})</span>
              {/if}
            </h3>
            <span class="principle-category">{getCategoryLabel(principle.principle.category)}</span>
          </div>
        </div>
        
        <p class="principle-summary">{principle.principle.summary}</p>
        
        {#if state.enabled}
          <div class="weight-slider">
            <span class="weight-label">
              重要度: <strong>{Math.round(state.weight * 100)}%</strong>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={state.weight}
              aria-label={`${principle.principle.name} の重要度`}
              oninput={(e) => onWeightChange(principle.meta.id, parseFloat(e.currentTarget.value))}
            />
            <div class="weight-hints">
              <span>低</span>
              <span>中</span>
              <span>高</span>
            </div>
          </div>
          
          {#if principle.principle.children && principle.principle.children.length > 0}
            <div class="children-list">
              <h4 class="children-title">含まれる原則:</h4>
              <ul>
                {#each principle.principle.children as child}
                  <li>
                    <strong>{child.name}</strong>: {child.promptFragment}
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
          
          {#if principle.principle.tensions && principle.principle.tensions.length > 0}
            <div class="tensions-warning">
              <span class="warning-icon">⚠️</span>
              <span>この原則は他の原則と緊張関係があります</span>
            </div>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .principle-toggle {
    margin-bottom: 2rem;
  }

  .toggle-title {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
    color: var(--color-text);
  }

  .toggle-description {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .principle-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .principle-item {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1rem;
    transition: all 0.2s;
  }

  .principle-item.enabled {
    border-color: var(--color-primary);
    background: rgba(99, 102, 241, 0.05);
  }

  .principle-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .principle-checkbox {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding-top: 0.125rem;
  }

  .principle-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    height: 1.25rem;
    width: 1.25rem;
    background-color: var(--color-bg);
    border: 2px solid var(--color-border);
    border-radius: 0.25rem;
    transition: all 0.2s;
  }

  .principle-checkbox:hover .checkmark {
    border-color: var(--color-primary);
  }

  .principle-checkbox input:checked ~ .checkmark {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .checkmark:after {
    content: '';
    position: absolute;
    display: none;
    left: 7px;
    top: 3px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .principle-checkbox input:checked ~ .checkmark:after {
    display: block;
  }

  .principle-info {
    flex: 1;
  }

  .principle-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    color: var(--color-text);
  }

  .name-ja {
    font-weight: 400;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .principle-category {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    background: var(--color-bg);
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
  }

  .principle-summary {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin: 0.5rem 0 0;
    padding-left: 2rem;
  }

  .weight-slider {
    margin-top: 1rem;
    padding-left: 2rem;
  }

  .weight-label {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    display: block;
    margin-bottom: 0.25rem;
  }

  .weight-label strong {
    color: var(--color-primary);
  }

  .weight-slider input[type='range'] {
    width: 100%;
    height: 6px;
    background: var(--color-border);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
  }

  .weight-slider input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--color-primary);
    border-radius: 50%;
    cursor: pointer;
  }

  .weight-hints {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  .children-list {
    margin-top: 1rem;
    padding-left: 2rem;
    background: var(--color-bg);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem 0.75rem 2rem;
  }

  .children-title {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin: 0 0 0.5rem;
  }

  .children-list ul {
    margin: 0;
    padding-left: 1rem;
    font-size: 0.8rem;
  }

  .children-list li {
    color: var(--color-text-muted);
    margin-bottom: 0.25rem;
  }

  .children-list li strong {
    color: var(--color-text);
  }

  .tensions-warning {
    margin-top: 0.75rem;
    padding-left: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--color-warning);
  }

  .warning-icon {
    font-size: 1rem;
  }
</style>

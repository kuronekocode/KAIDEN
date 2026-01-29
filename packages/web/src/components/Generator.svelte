<script lang="ts">
  import type { PersonaFile, PrincipleFile } from '@kaiden/core';
  import PersonaSelector from './PersonaSelector.svelte';
  import PrincipleToggle from './PrincipleToggle.svelte';
  import Preview from './Preview.svelte';
  import {
    createInitialState,
    createPrincipleStatesFromPersona,
    generateAgentsMd,
    type GeneratorState,
    type PrincipleState,
  } from '../stores/generator';
  
  interface Props {
    personas: PersonaFile[];
    principles: PrincipleFile[];
  }
  
  let { personas, principles }: Props = $props();
  
  // 状態管理
  let state = $state<GeneratorState>(createInitialState());
  
  // プレビューを自動更新
  let previewContent = $derived(generateAgentsMd(state, personas, principles));
  
  // ペルソナ選択時の処理
  function handlePersonaSelect(personaId: string) {
    const persona = personas.find(p => p.meta.id === personaId);
    if (persona) {
      state.selectedPersonaId = personaId;
      state.principleStates = createPrincipleStatesFromPersona(persona, principles);
    }
  }
  
  // 原則トグル処理
  function handleToggle(principleId: string, enabled: boolean) {
    const current = state.principleStates.get(principleId);
    if (current) {
      state.principleStates.set(principleId, {
        ...current,
        enabled,
      });
      // 再代入してリアクティブにする
      state.principleStates = new Map(state.principleStates);
    }
  }
  
  // 重み変更処理
  function handleWeightChange(principleId: string, weight: number) {
    const current = state.principleStates.get(principleId);
    if (current) {
      state.principleStates.set(principleId, {
        ...current,
        weight,
      });
      state.principleStates = new Map(state.principleStates);
    }
  }
  
  // エクスポート処理
  function handleExport() {
    const blob = new Blob([previewContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AGENTS.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // コピー処理
  function handleCopy() {
    // コピー成功時の処理（必要に応じて）
    console.log('Content copied to clipboard');
  }
</script>

<div class="generator">
  <div class="generator-sidebar">
    <div class="project-name">
      <label for="project-name">プロジェクト名（任意）</label>
      <input
        type="text"
        id="project-name"
        bind:value={state.projectName}
        placeholder="例: My Awesome Project"
      />
    </div>
    
    <PersonaSelector
      {personas}
      selectedId={state.selectedPersonaId}
      onSelect={handlePersonaSelect}
    />
    
    {#if state.selectedPersonaId}
      <PrincipleToggle
        {principles}
        states={state.principleStates}
        onToggle={handleToggle}
        onWeightChange={handleWeightChange}
      />
    {/if}
  </div>
  
  <div class="generator-preview">
    <Preview
      content={previewContent}
      onExport={handleExport}
      onCopy={handleCopy}
    />
  </div>
</div>

<style>
  .generator {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    min-height: calc(100vh - 200px);
  }

  @media (max-width: 1024px) {
    .generator {
      grid-template-columns: 1fr;
    }
    
    .generator-preview {
      height: 500px;
    }
  }

  .generator-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .generator-preview {
    position: sticky;
    top: 100px;
    height: calc(100vh - 180px);
  }

  .project-name {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .project-name label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .project-name input {
    padding: 0.625rem 0.875rem;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    color: var(--color-text);
    font-size: 0.9rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .project-name input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .project-name input::placeholder {
    color: var(--color-text-muted);
  }

  /* スクロールバーのスタイリング */
  .generator-sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .generator-sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .generator-sidebar::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }

  .generator-sidebar::-webkit-scrollbar-thumb:hover {
    background: var(--color-text-muted);
  }
</style>

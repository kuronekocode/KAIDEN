<script lang="ts">
  import type { PersonaFile } from '@kaiden/core';
  
  interface Props {
    personas: PersonaFile[];
    selectedId: string | null;
    onSelect: (id: string) => void;
  }
  
  let { personas, selectedId, onSelect }: Props = $props();
</script>

<div class="persona-selector">
  <h2 class="selector-title">👤 ペルソナを選択</h2>
  <p class="selector-description">開発スタイルに合ったペルソナを選んでください</p>
  
  <div class="persona-grid">
    {#each personas as persona (persona.meta.id)}
      {@const isSelected = selectedId === persona.meta.id}
      <button
        class="persona-card"
        class:selected={isSelected}
        onclick={() => onSelect(persona.meta.id)}
      >
        <div class="persona-icon">{persona.persona.icon ?? '👤'}</div>
        <div class="persona-info">
          <h3 class="persona-name">{persona.persona.name}</h3>
          <p class="persona-id">{persona.meta.id}</p>
          <p class="persona-desc">{persona.persona.description.split('\n')[0]}</p>
        </div>
        {#if isSelected}
          <div class="selected-badge">✓ 選択中</div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .persona-selector {
    margin-bottom: 2rem;
  }

  .selector-title {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
    color: var(--color-text);
  }

  .selector-description {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .persona-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .persona-card {
    background: var(--color-bg-secondary);
    border: 2px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    text-align: left;
    position: relative;
    width: 100%;
    color: inherit;
    font-family: inherit;
  }

  .persona-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  .persona-card.selected {
    border-color: var(--color-primary);
    background: rgba(99, 102, 241, 0.1);
  }

  .persona-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .persona-info {
    flex: 1;
    min-width: 0;
  }

  .persona-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    color: var(--color-text);
  }

  .persona-id {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin: 0 0 0.5rem;
    font-family: var(--font-mono);
  }

  .persona-desc {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .selected-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: var(--color-primary);
    color: white;
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-weight: 600;
  }
</style>

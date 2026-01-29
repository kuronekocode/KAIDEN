<script lang="ts">
  interface Props {
    content: string;
    onExport: () => void;
    onCopy: () => void;
  }
  
  let { content, onExport, onCopy }: Props = $props();
  
  let copied = $state(false);
  
  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    copied = true;
    onCopy();
    
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<div class="preview">
  <div class="preview-header">
    <h2 class="preview-title">📄 プレビュー</h2>
    <div class="preview-actions">
      <button class="action-btn" onclick={handleCopy} title="クリップボードにコピー">
        {#if copied}
          <span class="icon">✓</span> コピー済み
        {:else}
          <span class="icon">📋</span> コピー
        {/if}
      </button>
      <button class="action-btn primary" onclick={onExport} title="ファイルとしてダウンロード">
        <span class="icon">💾</span> ダウンロード
      </button>
    </div>
  </div>
  
  <div class="preview-content">
    <pre><code>{content}</code></pre>
  </div>
</div>

<style>
  .preview {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg);
  }

  .preview-title {
    font-size: 1rem;
    margin: 0;
    color: var(--color-text);
  }

  .preview-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    border: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    color: var(--color-text);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .action-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .action-btn.primary {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }

  .action-btn.primary:hover {
    background: var(--color-primary-dark);
    border-color: var(--color-primary-dark);
    color: white;
  }

  .icon {
    font-size: 1rem;
  }

  .preview-content {
    flex: 1;
    overflow: auto;
    padding: 1rem;
  }

  .preview-content pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: var(--color-text);
  }

  .preview-content code {
    display: block;
  }
</style>

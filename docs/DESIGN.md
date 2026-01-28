# kaiden 設計ドキュメント

## 1. 設計思想

### 1.1 原理参照型プロンプティング

従来のエージェント設定ツールは「繰り返し指示されたら追記」というアプローチを取る。これは本質的に症状へのパッチ当てであり、プロンプトの肥大化を招く。

kaidenは異なるアプローチを取る：

```
┌─────────────────────────────────────────────────────┐
│ 従来のアンチパターン                                 │
│                                                     │
│ エラー発生 → ルール追加 → エラー発生 → ルール追加    │
│                     ↓                               │
│             プロンプト肥大化 + 文脈の希釈            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ kaidenのアプローチ                                   │
│                                                     │
│ 1. 事前学習済み知識へのポインタ（原則名）            │
│ 2. 推論経路を誘導する最小限のトークン                │
│ 3. プロジェクト固有の「差分」だけを明示              │
└─────────────────────────────────────────────────────┘
```

### 1.2 注意機構への働きかけ

LLMの注意機構において、重要な概念の複数回出現は推論精度を向上させる（repetition-based attention steering）。

kaidenでは：

1. **セット名の宣言**: 「SOLID準拠」
2. **個別原則の展開**: SRP, OCP, LSP, ISP, DIP

この二層構造により、「SOLID」というトークンが推論方向を決定しつつ、個別原則で注意が強化される。

### 1.3 FAIR原則準拠のデータ設計

| 原則 | 実装 |
|------|------|
| Findable | 一意識別子（`principle:solid`）、メタデータ |
| Accessible | YAML（人間可読）、JSON Schema（機械可読） |
| Interoperable | 標準スキーマ、言語別ファイル分離 |
| Reusable | MITライセンス、セマンティックバージョニング |

## 2. データモデル

### 2.1 原則（Principle）

```yaml
$schema: "../schemas/principle.schema.json"
meta:
  id: "principle:solid"           # 一意識別子
  version: "1.0.0"                # セマンティックバージョン
  lang: "ja"                      # 言語コード
  license: "CC-BY-4.0"            # ライセンス
  lastUpdated: "2025-01-28"       # 最終更新日

principle:
  name: "SOLID"                   # 表示名
  category: "object-oriented-design"  # カテゴリ
  summary: "オブジェクト指向設計の5原則"  # 概要
  
  # 推論誘導用のキーフレーズ（生成時に使用）
  triggerTokens:
    - "SOLID原則"
    - "SOLID準拠"
    
  # 子原則（階層構造）
  children:
    - id: "principle:srp"
      name: "Single Responsibility"
      nameJa: "単一責任の原則"
      description: "クラスは変更理由を1つだけ持つべき"
      promptFragment: "各モジュールは単一の責務を持つ"
      
    - id: "principle:ocp"
      name: "Open/Closed"
      nameJa: "開放閉鎖の原則"
      description: "拡張に対して開き、修正に対して閉じる"
      promptFragment: "拡張に開き、修正に閉じる"
      
    # ... 他の原則
      
  # 緊張関係（トレードオフ）
  tensions:
    - with: "principle:yagni"
      description: "将来の拡張性を考慮した抽象化がYAGNI違反になりがち"
      severity: "medium"  # low, medium, high
      
    - with: "principle:kiss"
      description: "OCP準拠の抽象化が単純さを犠牲にする場合がある"
      severity: "low"
      
  # ペルソナとの関連（参照情報）
  recommendedFor:
    - persona: "auditor"
      weight: 1.0
    - persona: "speed-coder"
      weight: 0.3
```

### 2.2 ペルソナ（Persona）

```yaml
$schema: "../schemas/persona.schema.json"
meta:
  id: "persona:auditor"
  version: "1.2.0"
  lang: "ja"
  changelog:
    - version: "1.2.0"
      date: "2025-01-28"
      changes:
        - "セキュリティ原則を推奨に追加"
    - version: "1.1.0"
      date: "2025-01-15"
      changes:
        - "SOLID weightを0.9→1.0に調整"
    - version: "1.0.0"
      date: "2025-01-01"
      changes:
        - "初版リリース"

persona:
  name: "コードレビュアー / 監査者"
  description: "品質・保守性・セキュリティを重視したレビュー"
  icon: "🔍"  # 表示用アイコン
  
  # デフォルト設定
  defaults:
    principles:
      - id: "principle:solid"
        enabled: true
        weight: 1.0
      - id: "principle:dry"
        enabled: true
        weight: 0.8
      - id: "principle:yagni"
        enabled: false  # このペルソナではオフ推奨
        weight: 0.3
    
    style:
      verbosity: "detailed"      # minimal, standard, detailed
      tone: "analytical"         # friendly, neutral, analytical
      focusAreas:
        - "edge-cases"
        - "security"
        - "maintainability"
        - "test-coverage"
        
  # 依存するバージョン範囲
  dependencies:
    principles:
      "principle:solid": ">=1.0.0 <2.0.0"
      "principle:dry": ">=1.0.0"
```

### 2.3 MCP（Model Context Protocol）

```yaml
$schema: "../schemas/mcp.schema.json"
meta:
  id: "mcp:filesystem"
  version: "2.1.0"
  sourceUrl: "https://github.com/anthropics/anthropic-quickstarts"
  lastChecked: "2025-01-28"
  checksum: "sha256:abc123..."  # ソース変更検知用

mcp:
  name: "@anthropic/mcp-filesystem"
  displayName: "ファイルシステム"
  description: "ローカルファイルシステムへの読み書きアクセス"
  category: "system"  # system, web, database, ai, productivity
  
  # セットアップ情報
  setup:
    authRequired: false
    envVariables: []  # 必要な環境変数
    
    configTemplate: |
      {
        "mcpServers": {
          "filesystem": {
            "command": "npx",
            "args": ["-y", "@anthropic/mcp-filesystem", "{rootPath}"]
          }
        }
      }
      
    variables:
      - name: "rootPath"
        description: "アクセスを許可するルートディレクトリ"
        required: true
        default: "."
        
  # 関連リンク
  links:
    docs: "https://github.com/anthropics/anthropic-quickstarts/tree/main/mcp-filesystem"
    npm: "https://www.npmjs.com/package/@anthropic/mcp-filesystem"
    changelog: "https://github.com/anthropics/anthropic-quickstarts/releases"
    
  # 提供されるツール
  tools:
    - name: "read_file"
      description: "ファイルの内容を読み取る"
    - name: "write_file"
      description: "ファイルに内容を書き込む"
    - name: "list_directory"
      description: "ディレクトリの内容を一覧表示"
```

## 3. 生成ロジック

### 3.1 AGENTS.md 生成フロー

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  ペルソナ    │────▶│  原則解決    │────▶│  テンプレート │
│  選択       │     │             │     │  適用       │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  緊張関係    │
                    │  チェック    │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ AGENTS.md   │
                    │  出力       │
                    └─────────────┘
```

### 3.2 生成テンプレート

```markdown
# プロジェクト設定

## 設計哲学

{persona.description}

## 設計原則

{#each enabledPrinciples as principle}
### {principle.name}（{principle.nameJa}）

{principle.triggerTokens[0]}で設計すること。

{#each principle.children as child}
- **{child.name}**: {child.promptFragment}
{/each}

{#if principle.tensions.length > 0}
**注意**: {#each principle.tensions as tension}{tension.description}{/each}
{/if}
{/each}

## スタイル

- 詳細度: {style.verbosity}
- トーン: {style.tone}
- 重点領域: {style.focusAreas.join(', ')}

## このプロジェクト固有の設定

<!-- ユーザーが追記する領域 -->
```

### 3.3 バージョン解決アルゴリズム

```typescript
interface VersionConstraint {
  principleId: string;
  range: string;  // semver range
}

function resolveVersions(
  constraints: VersionConstraint[],
  availablePrinciples: Map<string, PrincipleData[]>
): Result<ResolvedPrinciples, VersionConflict[]> {
  
  const resolved = new Map<string, PrincipleData>();
  const conflicts: VersionConflict[] = [];
  
  for (const constraint of constraints) {
    const versions = availablePrinciples.get(constraint.principleId);
    if (!versions) {
      conflicts.push({ type: 'not-found', principleId: constraint.principleId });
      continue;
    }
    
    const matching = versions.filter(v => 
      semver.satisfies(v.meta.version, constraint.range)
    );
    
    if (matching.length === 0) {
      conflicts.push({
        type: 'no-matching-version',
        principleId: constraint.principleId,
        requested: constraint.range,
        available: versions.map(v => v.meta.version)
      });
      continue;
    }
    
    // 最新のマッチするバージョンを選択
    resolved.set(
      constraint.principleId,
      matching.sort((a, b) => 
        semver.compare(b.meta.version, a.meta.version)
      )[0]
    );
  }
  
  return conflicts.length > 0 
    ? { ok: false, errors: conflicts }
    : { ok: true, value: resolved };
}
```

## 4. UI設計

### 4.1 メイン画面構成

```
┌─────────────────────────────────────────────────────────────┐
│  kaiden - エージェント設定ビルダー                    [🌙]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐   ┌─────────────────────────────────┐ │
│  │ ペルソナ         │   │ プレビュー                       │ │
│  │                 │   │                                 │ │
│  │ ○ Speed Coder  │   │ ```markdown                     │ │
│  │ ● Consultant   │   │ # プロジェクト設定               │ │
│  │ ○ Auditor      │   │                                 │ │
│  │ ○ Mentor       │   │ ## 設計哲学                     │ │
│  │                 │   │ ...                             │ │
│  ├─────────────────┤   │ ```                             │ │
│  │ 原則            │   │                                 │ │
│  │                 │   │ ┌─────────────────────────────┐ │ │
│  │ ☑ SOLID [1.0]  │   │ │ [AGENTS.md] [SKILL.md] [MCP]│ │ │
│  │   ├ ☑ SRP      │   │ └─────────────────────────────┘ │ │
│  │   ├ ☑ OCP      │   │                                 │ │
│  │   └ ...        │   │ [コピー] [ダウンロード] [保存]   │ │
│  │ ☑ DRY [1.0]    │   └─────────────────────────────────┘ │
│  │ ☐ YAGNI        │                                       │
│  │   ⚠ SOLIDと緊張│                                       │
│  │                 │                                       │
│  ├─────────────────┤                                       │
│  │ MCP            │                                       │
│  │                 │                                       │
│  │ ☑ filesystem   │                                       │
│  │ ☐ github       │                                       │
│  │ ☑ web-search   │                                       │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 インタラクション

1. **ペルソナ選択**: ラジオボタン、選択で推奨原則がプリセット
2. **原則トグル**: チェックボックス、緊張関係は警告アイコン表示
3. **バージョン固定**: 原則名横のバージョン番号クリックで固定/最新切替
4. **プレビュー**: リアルタイム更新、タブ切替（AGENTS.md / SKILL.md / MCP）
5. **エクスポート**: クリップボードコピー、ファイルダウンロード、お気に入り保存

## 5. CLI設計

### 5.1 コマンド一覧

```bash
# 初期化（対話形式）
kaiden init

# 生成
kaiden generate --persona auditor --output ./AGENTS.md
kaiden generate --config ./kaiden.yaml

# プリセット管理
kaiden preset list
kaiden preset save my-config
kaiden preset load my-config

# MCP インストール（設定ファイル生成）
kaiden mcp add filesystem github
kaiden mcp list

# 検証
kaiden validate ./AGENTS.md
```

### 5.2 設定ファイル（kaiden.yaml）

```yaml
# kaiden.yaml
version: "1"

persona: auditor
personaVersion: "1.2.0"  # 省略時は最新

principles:
  - id: principle:solid
    version: ">=1.0.0"
    enabled: true
    children:
      srp: true
      ocp: true
      lsp: false  # 部分的に無効化
      isp: true
      dip: true
      
  - id: principle:dry
    enabled: true
    
mcps:
  - id: mcp:filesystem
    config:
      rootPath: "./src"
  - id: mcp:github
    
output:
  agentsMd: "./AGENTS.md"
  skillMd: "./SKILL.md"
  mcpConfig: "./.mcp/config.json"
```

## 6. 将来の拡張

### 6.1 Phase 2: クラウド同期（オプション）

- Firebase Authentication
- Firestore でお気に入り同期
- チーム共有機能

### 6.2 Phase 3: コミュニティ

- カスタム原則の投稿
- カスタムペルソナの共有
- 評価・フィードバック

### 6.3 Phase 4: インテリジェント機能

- プロジェクト分析による原則推奨
- 使用パターンからの学習
- A/Bテスト的な効果測定

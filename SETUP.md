# kaiden 初期セットアップ手順

## Claude Code での開発開始手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/kuronekocode/kaiden.git
cd kaiden
```

### 2. ドキュメントのコピー

このディレクトリにある以下のファイルをリポジトリにコピーしてください：

```
kaiden-docs/
├── AGENTS.md                    → リポジトリルートへ
├── docs/
│   ├── DESIGN.md               → docs/ へ
│   └── SCHEMA.md               → docs/ へ
└── data/
    ├── principles/
    │   └── ja/
    │       └── solid.yaml      → data/principles/ja/ へ
    ├── personas/
    │   └── ja/
    │       ├── auditor.yaml    → data/personas/ja/ へ
    │       └── speed-coder.yaml
    └── mcps/
        └── filesystem.yaml     → data/mcps/ へ
```

### 3. プロジェクト構造の作成

```bash
# ディレクトリ構造を作成
mkdir -p packages/core/src/{generators,resolvers,validators}
mkdir -p packages/cli/src/{commands,mcp}
mkdir -p packages/web/src/{pages,components,layouts}
mkdir -p data/schemas
mkdir -p data/principles/{ja,en}
mkdir -p data/personas/{ja,en}
mkdir -p data/mcps
mkdir -p docs
mkdir -p .github/workflows
```

### 4. ワークスペース設定

```bash
# pnpm ワークスペースの初期化
pnpm init

# pnpm-workspace.yaml の作成
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
EOF
```

### 5. 開発の優先順位

Claude Code に以下の順序で実装を依頼してください：

#### Phase 1: 基盤（最優先）

1. **JSON Schema ファイルの作成**
   - `data/schemas/principle.schema.json`
   - `data/schemas/persona.schema.json`
   - `data/schemas/mcp.schema.json`

2. **core パッケージの初期化**
   ```bash
   cd packages/core
   pnpm init
   pnpm add typescript ajv ajv-formats yaml semver
   pnpm add -D @types/node vitest
   ```

3. **TypeScript 設定**
   - `tsconfig.json` の作成
   - 型定義の自動生成スクリプト

4. **バリデーション機能**
   - スキーマ検証ロジック
   - CI用の検証スクリプト

#### Phase 2: 生成ロジック

5. **AGENTS.md ジェネレーター**
   - テンプレートエンジン
   - 原則解決ロジック
   - バージョン解決

6. **CLI の基本コマンド**
   ```bash
   cd packages/cli
   pnpm init
   pnpm add commander
   ```
   - `kaiden generate` コマンド
   - `kaiden validate` コマンド

#### Phase 3: Web UI

7. **Astro プロジェクトの初期化**
   ```bash
   cd packages/web
   pnpm create astro@latest . --template minimal
   pnpm add @astrojs/svelte svelte
   ```

8. **コンポーネント実装**
   - ペルソナセレクター
   - 原則トグル
   - プレビューパネル

### 6. Claude Code への指示例

```
AGENTS.md を読んで、Phase 1 の JSON Schema ファイルを作成してください。
docs/SCHEMA.md に定義が記載されています。
```

```
core パッケージを初期化し、スキーマ検証機能を実装してください。
data/principles/ja/solid.yaml をサンプルとして検証できるようにしてください。
```

```
AGENTS.md ジェネレーターを実装してください。
ペルソナと原則の組み合わせから AGENTS.md を生成する機能です。
```

## 注意事項

- **日本語を最優先**: ドキュメント、コメント、UIすべて日本語で
- **FAIR原則準拠**: データファイルにはバージョン、ライセンスを明記
- **型安全**: TypeScript で `any` は使用禁止
- **テスト**: 各機能にユニットテストを追加

## 参考リンク

- Astro: https://astro.build/
- Svelte: https://svelte.dev/
- JSON Schema: https://json-schema.org/
- pnpm Workspaces: https://pnpm.io/workspaces

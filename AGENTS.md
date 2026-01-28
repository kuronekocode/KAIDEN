# kaiden - AGENTS.md

## プロジェクト概要

**kaiden（皆伝）** は、LLMエージェントの振る舞いを「原理参照型」で最適化するツールです。

従来の「具体的指示の蓄積」ではなく、LLMが事前学習済みの設計原則（SOLID、DRY等）への参照を通じて推論を誘導し、プロンプトの肥大化を防ぎます。

## 設計哲学

```
❌ 従来のアプローチ（肥大化する）
- 変数名はcamelCaseで
- 関数は20行以内で
- エラーハンドリングは早期リターンで
- ...（100項目）

✅ kaidenのアプローチ（原理参照型）
設計原則: SOLID, DRY, YAGNI
→ 事前学習済み知識へのポインタとして機能
→ プロジェクト固有の「差分」だけを明示
```

## 技術スタック

| カテゴリ | 選定 | 理由 |
|---------|------|------|
| 言語 | TypeScript | 全レイヤー統一、型安全性 |
| データ形式 | YAML + JSON Schema | 人間編集可、Git差分可読、バリデーション |
| Web UI | Astro + Svelte | 静的生成、軽量、Content Collections |
| CLI | Commander.js | MCP対応、標準的 |
| ストレージ | localStorage → IndexedDB | サーバーレス、段階的拡張 |
| スキーマ | JSON Schema Draft 2020-12 | TypeScript型自動生成 |

## ディレクトリ構成

```
kaiden/
├── packages/
│   ├── core/                 # 生成ロジック（MIT）
│   │   ├── src/
│   │   │   ├── generators/   # AGENTS.md, SKILL.md, MCP設定生成
│   │   │   ├── resolvers/    # 依存解決、バージョン解決
│   │   │   └── validators/   # スキーマ検証
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cli/                  # CLIツール
│   │   ├── src/
│   │   │   ├── commands/     # init, generate, install, sync
│   │   │   └── mcp/          # MCP統合
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                  # Astro サイト
│       ├── src/
│       │   ├── pages/        # ルーティング
│       │   ├── components/   # Svelte コンポーネント
│       │   ├── layouts/      # レイアウト
│       │   └── content/      # → data/ を参照
│       ├── astro.config.mjs
│       ├── package.json
│       └── tsconfig.json
│
├── data/
│   ├── schemas/              # JSON Schema定義
│   │   ├── principle.schema.json
│   │   ├── persona.schema.json
│   │   └── mcp.schema.json
│   │
│   ├── principles/           # 原則データ（FAIR準拠）
│   │   ├── ja/               # 日本語（primary）
│   │   │   ├── solid.yaml
│   │   │   ├── dry.yaml
│   │   │   ├── yagni.yaml
│   │   │   ├── kiss.yaml
│   │   │   └── ...
│   │   └── en/               # 英語
│   │
│   ├── personas/             # ペルソナ定義
│   │   ├── ja/
│   │   │   ├── speed-coder.yaml
│   │   │   ├── consultant.yaml
│   │   │   ├── auditor.yaml
│   │   │   └── ...
│   │   └── en/
│   │
│   └── mcps/                 # MCP情報（言語非依存）
│       ├── filesystem.yaml
│       ├── github.yaml
│       └── ...
│
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml        # GitHub Pages デプロイ
│   │   ├── validate.yml      # スキーマ検証
│   │   └── check-updates.yml # MCP更新チェック（週次）
│   └── CONTRIBUTING.md
│
├── docs/                     # 日本語ドキュメント
│   ├── DESIGN.md
│   ├── SCHEMA.md
│   └── CONTRIBUTING.ja.md
│
├── AGENTS.md                 # このファイル
├── LICENSE                   # MIT
├── README.md
├── package.json              # ワークスペース設定
└── pnpm-workspace.yaml
```

## コーディング規約

### 設計原則

- **SOLID準拠**: 特にSRP（単一責任）とDIP（依存性逆転）を重視
- **型安全**: `any` 禁止、`unknown` + 型ガード推奨
- **イミュータブル**: データ変換はコピー、破壊的変更禁止

### TypeScript

```typescript
// ✅ 良い例
interface PrincipleData {
  readonly id: string;
  readonly version: string;
  readonly children?: readonly PrincipleData[];
}

function resolveDependencies(
  persona: PersonaData,
  principles: ReadonlyMap<string, PrincipleData>
): Result<ResolvedConfig, DependencyError> {
  // ...
}

// ❌ 悪い例
function process(data: any): any {
  data.modified = true; // 破壊的変更
  return data;
}
```

### ファイル命名

- TypeScript: `kebab-case.ts`
- YAML データ: `kebab-case.yaml`
- コンポーネント: `PascalCase.svelte`

### コミットメッセージ

```
feat(core): 原則間の緊張関係解決を追加
fix(cli): generate コマンドのバージョン指定バグ修正
docs: スキーマ定義ドキュメント更新
```

## 重要な実装ポイント

### 1. 原則の階層構造と推論誘導

原則は「セット名 + 個別原則」の両方をプロンプトに含めることで注意を強化する。

```yaml
# 生成されるAGENTS.mdの例
設計原則: SOLID準拠

詳細:
- Single Responsibility: 各モジュールは単一の責務を持つ
- Open/Closed: 拡張に開き、修正に閉じる
# ... （個別原則の明示で注意が分散せず強化される）
```

### 2. バージョン管理（FAIR原則）

- 各データファイルに `meta.version` を持つ
- ペルソナは依存する原則のバージョン範囲を指定
- ユーザーは「固定」or「最新追従」を選択可能

```yaml
persona:
  dependencies:
    principles:
      "principle:solid": ">=1.0.0 <2.0.0"
```

### 3. 緊張関係の表示

原則間のトレードオフをユーザーに明示する。

```yaml
tensions:
  - with: "principle:yagni"
    description: "将来の拡張性を考慮した抽象化がYAGNI違反になりがち"
    severity: "medium"
```

## 開発フロー

### Phase 1: 基盤（現在）

1. [ ] JSON Schema 定義
2. [ ] サンプルデータ作成（SOLID, DRY, YAGNI, KISS, 3ペルソナ, 主要MCP）
3. [ ] core パッケージ - 生成ロジック
4. [ ] CLI - generate コマンド

### Phase 2: Web UI

5. [ ] Astro プロジェクトセットアップ
6. [ ] トグルUI（原則、ペルソナ）
7. [ ] プレビュー・エクスポート
8. [ ] GitHub Pages デプロイ

### Phase 3: 拡張

9. [ ] MCP統合（CLI経由インストール）
10. [ ] お気に入り保存（localStorage）
11. [ ] PWA化（オフライン対応）

## テスト方針

- **スキーマ検証**: 全YAMLファイルをJSON Schemaで検証（CI必須）
- **生成ロジック**: Vitest でユニットテスト
- **E2E**: 生成されたAGENTS.mdが期待通りか検証

## セキュリティ考慮

- ユーザーデータはブラウザ内のみ（サーバー送信なし）
- 外部MCPのセットアップは認証情報を扱わない（リンク提供のみ）
- YAML パースは `yaml` ライブラリ使用（eval禁止）

## 参考リソース

- AGENTS.md 仕様: https://github.com/humanalog/agents-md
- Agent Skills 仕様: https://agentskills.io
- MCP 仕様: https://modelcontextprotocol.io
- FAIR原則: https://www.go-fair.org/fair-principles/

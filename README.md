# kaiden

AIエージェントとMCPの最適化

## 🧪 テスト実行

### セットアップ

#### 初回セットアップ（自動）

**Unix/Mac:**
```bash
bash scripts/setup-test-env.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-test-env.ps1
```

セットアップスクリプトは以下を自動で実行します:
- ✅ Node.jsバージョン確認（v20以上を推奨）
- ✅ pnpmの確認とインストール（必要に応じて）
- ✅ プロジェクト依存関係のインストール
- ✅ coreパッケージのビルド

#### 環境チェック

```bash
npm run setup
```

### テスト実行

```bash
# 全テスト実行
npm test

# ウォッチモード（ファイル変更時に自動再実行）
npm run test:watch

# カバレッジ測定
npm run test:coverage

# 全パッケージのテスト実行
npm run test:all
```

### 個別パッケージでのテスト実行

```bash
cd packages/core
pnpm test                    # 全テスト
pnpm test -- data-loader     # 特定ファイルのみ
pnpm test -- --coverage      # カバレッジ付き
```

### トラブルシューティング

**pnpmが見つからない場合:**
```bash
npm install -g pnpm
```

**テストが失敗する場合:**
1. `pnpm install` で依存関係を再インストール
2. `cd packages/core && pnpm build` でビルド
3. Node.js v20以上を使用していることを確認

**Windowsでスクリプト実行エラーが出る場合:**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass
```

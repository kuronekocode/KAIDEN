#!/bin/bash
set -e

echo "🚀 Kaiden テスト環境セットアップスクリプト"
echo ""

# Node.jsバージョンチェック
echo "📋 Node.jsバージョン確認..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません"
    echo "   https://nodejs.org/ からインストールしてください（推奨: v20以上）"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION がインストールされています"

# pnpmチェックとインストール
echo ""
echo "📋 pnpmチェック..."
if ! command -v pnpm &> /dev/null; then
    echo "⚙️  pnpmをインストールしています..."
    npm install -g pnpm
    echo "✅ pnpmをインストールしました"
else
    PNPM_VERSION=$(pnpm -v)
    echo "✅ pnpm $PNPM_VERSION がインストールされています"
fi

# プロジェクトルートに移動
cd "$(dirname "$0")/.."

# 依存関係のインストール
echo ""
echo "📦 依存関係をインストールしています..."
pnpm install

# coreパッケージのビルド
echo ""
echo "🔨 coreパッケージをビルドしています..."
cd packages/core
pnpm build

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "🧪 テストを実行するには:"
echo "   cd packages/core"
echo "   pnpm test                # 全テスト実行"
echo "   pnpm test -- --coverage  # カバレッジ付き実行"
echo ""

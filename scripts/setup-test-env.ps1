# PowerShellスクリプト
Write-Host "🚀 Kaiden テスト環境セットアップスクリプト" -ForegroundColor Cyan
Write-Host ""

# Node.jsバージョンチェック
Write-Host "📋 Node.jsバージョン確認..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion がインストールされています" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.jsがインストールされていません" -ForegroundColor Red
    Write-Host "   https://nodejs.org/ からインストールしてください（推奨: v20以上）" -ForegroundColor Red
    exit 1
}

# pnpmチェックとインストール
Write-Host ""
Write-Host "📋 pnpmチェック..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm -v
    Write-Host "✅ pnpm $pnpmVersion がインストールされています" -ForegroundColor Green
} catch {
    Write-Host "⚙️  pnpmをインストールしています..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "✅ pnpmをインストールしました" -ForegroundColor Green
}

# プロジェクトルートに移動
Set-Location (Split-Path -Parent $PSScriptRoot)

# 依存関係のインストール
Write-Host ""
Write-Host "📦 依存関係をインストールしています..." -ForegroundColor Yellow
pnpm install

# coreパッケージのビルド
Write-Host ""
Write-Host "🔨 coreパッケージをビルドしています..." -ForegroundColor Yellow
Set-Location packages\core
pnpm build

Write-Host ""
Write-Host "✅ セットアップ完了！" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 テストを実行するには:" -ForegroundColor Cyan
Write-Host "   cd packages\core"
Write-Host "   pnpm test                # 全テスト実行"
Write-Host "   pnpm test -- --coverage  # カバレッジ付き実行"
Write-Host ""

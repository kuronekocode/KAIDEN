#!/usr/bin/env node

/**
 * 環境チェックとセットアップガイド
 */

import { execSync } from 'node:child_process';
import os from 'node:os';

const platform = os.platform();
const setupScript = platform === 'win32'
  ? '.\\scripts\\setup-test-env.ps1'
  : './scripts/setup-test-env.sh';

console.log('🔍 Kaiden テスト環境チェック');
console.log('');

// Node.jsチェック
try {
  const nodeVersion = execSync('node -v', { encoding: 'utf-8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
} catch (err) {
  console.log('❌ Node.js: 未インストール');
  console.log('   https://nodejs.org/ からインストールしてください');
  process.exit(1);
}

// pnpmチェック
try {
  const pnpmVersion = execSync('pnpm -v', { encoding: 'utf-8' }).trim();
  console.log(`✅ pnpm: ${pnpmVersion}`);
} catch (err) {
  console.log('⚠️  pnpm: 未インストール');
  console.log('   以下のコマンドで自動セットアップできます:');
  console.log('');
  if (platform === 'win32') {
    console.log(`   powershell -ExecutionPolicy Bypass -File ${setupScript}`);
  } else {
    console.log(`   bash ${setupScript}`);
  }
  console.log('');
  process.exit(1);
}

console.log('');
console.log('✅ 環境チェック完了！テストを実行できます。');
console.log('');
console.log('📚 使用方法:');
console.log('   npm test              # 全テスト実行');
console.log('   npm run test:watch    # ウォッチモード');
console.log('   npm run test:coverage # カバレッジ測定');
console.log('');

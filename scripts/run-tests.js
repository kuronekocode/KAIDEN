#!/usr/bin/env node

/**
 * クロスプラットフォーム対応テスト実行スクリプト
 */

import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const platform = os.platform();
const coreDir = join(__dirname, '..', 'packages', 'core');

console.log('🧪 Kaidenテストランナー');
console.log(`📍 プラットフォーム: ${platform}`);
console.log('');

// テスト実行コマンド
const testCmd = platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const testArgs = process.argv.slice(2).filter(arg => arg !== '--');

// Always start with 'test' command, then add any additional args
const args = ['test', ...testArgs];

console.log(`💻 実行コマンド: ${testCmd} ${args.join(' ')}`);
console.log('');

// テスト実行
const testProcess = spawn(testCmd, args, {
  cwd: coreDir,
  stdio: 'inherit',
  shell: true
});

testProcess.on('exit', (code) => {
  if (code === 0) {
    console.log('');
    console.log('✅ テスト完了！');
  } else {
    console.log('');
    console.log(`❌ テスト失敗（終了コード: ${code}）`);
    process.exit(code);
  }
});

testProcess.on('error', (err) => {
  console.error('❌ テスト実行エラー:', err);
  process.exit(1);
});

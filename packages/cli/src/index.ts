#!/usr/bin/env node
/**
 * kaiden CLI
 * LLMエージェントの振る舞いを原理参照型で最適化するツール
 */

import { Command } from 'commander';
import { validateCommand } from './commands/validate.js';
import { generateCommand } from './commands/generate.js';
import { listCommand } from './commands/list.js';

const program = new Command();

program
  .name('kaiden')
  .description('LLMエージェントの振る舞いを原理参照型で最適化するツール')
  .version('0.1.0');

// validate コマンド
program
  .command('validate')
  .description('データファイルのスキーマ検証')
  .option('-t, --type <type>', '検証対象 (all, principles, personas, mcps)', 'all')
  .action(async (options: { type: string }) => {
    await validateCommand({
      type: options.type as 'all' | 'principles' | 'personas' | 'mcps',
    });
  });

// generate コマンド
program
  .command('generate')
  .description('AGENTS.md ファイルを生成')
  .requiredOption('-p, --persona <id>', 'ペルソナID (例: auditor, speed-coder)')
  .option('-o, --output <path>', '出力ファイルパス', './AGENTS.generated.md')
  .option('-n, --project-name <name>', 'プロジェクト名')
  .action(async (options: { persona: string; output: string; projectName?: string }) => {
    await generateCommand({
      persona: options.persona,
      output: options.output,
      projectName: options.projectName,
    });
  });

// list コマンド
program
  .command('list <type>')
  .description('利用可能なペルソナまたは原則を一覧表示')
  .action(async (type: string) => {
    if (type !== 'personas' && type !== 'principles') {
      console.error('タイプは personas または principles を指定してください');
      process.exit(1);
    }
    await listCommand({ type });
  });

program.parse();

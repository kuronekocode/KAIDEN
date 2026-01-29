/**
 * validate コマンド
 * データファイルのスキーマ検証
 */

import { join } from 'node:path';
import chalk from 'chalk';
import {
  createDataValidator,
  type SchemaType,
} from '@kaiden/core';

interface ValidateOptions {
  readonly type?: 'all' | 'principles' | 'personas' | 'mcps';
}

interface ValidationConfig {
  readonly schemaType: SchemaType;
  readonly directory: string;
  readonly label: string;
}

export async function validateCommand(options: ValidateOptions): Promise<void> {
  const rootDir = join(process.cwd(), 'data');
  const schemasDir = join(rootDir, 'schemas');

  const validator = createDataValidator(schemasDir);

  const allConfigs: readonly ValidationConfig[] = [
    {
      schemaType: 'principle',
      directory: join(rootDir, 'principles'),
      label: '原則',
    },
    {
      schemaType: 'persona',
      directory: join(rootDir, 'personas'),
      label: 'ペルソナ',
    },
    {
      schemaType: 'mcp',
      directory: join(rootDir, 'mcps'),
      label: 'MCP',
    },
  ];

  const configs = filterConfigs(allConfigs, options.type);

  console.log(chalk.blue('データファイルを検証中...\n'));

  let totalValid = 0;
  let totalInvalid = 0;

  for (const config of configs) {
    console.log(chalk.cyan(`[${config.label}]`) + ` ${config.directory}`);

    const result = await validator.validateDirectory({
      schemaType: config.schemaType,
      directory: config.directory,
    });

    if (!result.ok) {
      console.error(chalk.red(`  エラー: ${result.error.message}`));
      totalInvalid++;
      continue;
    }

    const { valid, invalid } = result.value;

    for (const v of valid) {
      console.log(chalk.green('  ✅') + ` ${v.filePath}`);
      totalValid++;
    }

    for (const inv of invalid) {
      console.log(chalk.red('  ❌') + ` ${inv.filePath}`);
      for (const error of inv.errors) {
        console.log(chalk.gray(`     - ${error}`));
      }
      totalInvalid++;
    }

    console.log('');
  }

  console.log('---');

  if (totalInvalid === 0) {
    console.log(chalk.green(`検証完了: ${totalValid} 件すべて成功 ✨`));
  } else {
    console.log(chalk.red(`検証完了: ${totalValid} 件成功, ${totalInvalid} 件失敗`));
    process.exit(1);
  }
}

function filterConfigs(
  configs: readonly ValidationConfig[],
  type?: 'all' | 'principles' | 'personas' | 'mcps'
): readonly ValidationConfig[] {
  if (!type || type === 'all') {
    return configs;
  }

  const typeMap: Record<string, SchemaType> = {
    principles: 'principle',
    personas: 'persona',
    mcps: 'mcp',
  };

  const schemaType = typeMap[type];
  return configs.filter((c) => c.schemaType === schemaType);
}

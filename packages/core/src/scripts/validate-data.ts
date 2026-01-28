/**
 * データファイル検証スクリプト
 * data/ ディレクトリ内のYAMLファイルをスキーマで検証
 */

import { join } from 'node:path';
import { createDataValidator, type SchemaType } from '../validators/index.js';

interface ValidationConfig {
  readonly schemaType: SchemaType;
  readonly directory: string;
  readonly label: string;
}

async function main(): Promise<void> {
  const rootDir = join(process.cwd(), 'data');
  const schemasDir = join(rootDir, 'schemas');

  const validator = createDataValidator(schemasDir);

  const configs: readonly ValidationConfig[] = [
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

  console.log('データファイルを検証中...\n');

  let totalValid = 0;
  let totalInvalid = 0;

  for (const config of configs) {
    console.log(`[${config.label}] ${config.directory}`);

    const result = await validator.validateDirectory({
      schemaType: config.schemaType,
      directory: config.directory,
    });

    if (!result.ok) {
      console.error(`  エラー: ${result.error.message}`);
      totalInvalid++;
      continue;
    }

    const { valid, invalid } = result.value;

    for (const v of valid) {
      console.log(`  ✅ ${v.filePath}`);
      totalValid++;
    }

    for (const inv of invalid) {
      console.log(`  ❌ ${inv.filePath}`);
      for (const error of inv.errors) {
        console.log(`     - ${error}`);
      }
      totalInvalid++;
    }

    console.log('');
  }

  console.log('---');
  console.log(`検証完了: ${totalValid} 件成功, ${totalInvalid} 件失敗`);

  if (totalInvalid > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('予期せぬエラー:', error);
  process.exit(1);
});

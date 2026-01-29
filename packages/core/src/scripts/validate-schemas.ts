/**
 * スキーマファイル検証スクリプト
 * JSON Schemaファイル自体が有効かどうかを検証
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

async function main(): Promise<void> {
  const schemasDir = join(process.cwd(), 'data', 'schemas');

  console.log('スキーマファイルを検証中...\n');

  // 動的インポートでESM/CJS互換性問題を回避
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ajv2020Module = await import('ajv/dist/2020.js') as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addFormatsModule = await import('ajv-formats') as any;

  const Ajv2020 = Ajv2020Module.default ?? Ajv2020Module;
  const addFormats = addFormatsModule.default ?? addFormatsModule;

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);

  let valid = 0;
  let invalid = 0;

  try {
    const files = await readdir(schemasDir);
    const schemaFiles = files.filter((f) => extname(f) === '.json');

    for (const file of schemaFiles) {
      const filePath = join(schemasDir, file);

      try {
        const content = await readFile(filePath, 'utf-8');
        const schema = JSON.parse(content) as Record<string, unknown>;

        // $idを削除してコンパイル
        const schemaCopy = { ...schema };
        delete schemaCopy['$id'];

        ajv.compile(schemaCopy);

        console.log(`✅ ${file}`);
        valid++;
      } catch (error) {
        console.log(`❌ ${file}`);
        if (error instanceof Error) {
          console.log(`   - ${error.message}`);
        }
        invalid++;
      }
    }

    console.log('\n---');
    console.log(`検証完了: ${valid} 件成功, ${invalid} 件失敗`);

    if (invalid > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('スキーマディレクトリの読み込みに失敗:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('予期せぬエラー:', error);
  process.exit(1);
});

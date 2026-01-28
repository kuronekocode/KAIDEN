/**
 * generate コマンド
 * AGENTS.md ファイルを生成
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import chalk from 'chalk';
import {
  createDataValidator,
  InMemoryPrincipleResolver,
  InMemoryPersonaResolver,
  DefaultAgentsGenerator,
  type PrincipleFile,
  type PersonaFile,
} from '@kaiden/core';

interface GenerateOptions {
  readonly persona: string;
  readonly output?: string;
  readonly projectName?: string;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const rootDir = join(process.cwd(), 'data');
  const schemasDir = join(rootDir, 'schemas');

  console.log(chalk.blue('AGENTS.md を生成中...\n'));

  // データをロード・検証
  const validator = createDataValidator(schemasDir);

  // 原則をロード
  console.log(chalk.cyan('原則データをロード中...'));
  const principlesResult = await validator.validateDirectory<PrincipleFile>({
    schemaType: 'principle',
    directory: join(rootDir, 'principles'),
  });

  if (!principlesResult.ok) {
    console.error(chalk.red(`エラー: ${principlesResult.error.message}`));
    process.exit(1);
  }

  if (principlesResult.value.invalid.length > 0) {
    console.error(chalk.red('原則データに検証エラーがあります:'));
    for (const inv of principlesResult.value.invalid) {
      console.error(chalk.red(`  - ${inv.filePath}: ${inv.errors.join(', ')}`));
    }
    process.exit(1);
  }

  // ペルソナをロード
  console.log(chalk.cyan('ペルソナデータをロード中...'));
  const personasResult = await validator.validateDirectory<PersonaFile>({
    schemaType: 'persona',
    directory: join(rootDir, 'personas'),
  });

  if (!personasResult.ok) {
    console.error(chalk.red(`エラー: ${personasResult.error.message}`));
    process.exit(1);
  }

  if (personasResult.value.invalid.length > 0) {
    console.error(chalk.red('ペルソナデータに検証エラーがあります:'));
    for (const inv of personasResult.value.invalid) {
      console.error(chalk.red(`  - ${inv.filePath}: ${inv.errors.join(', ')}`));
    }
    process.exit(1);
  }

  // リゾルバーに登録
  const principleResolver = new InMemoryPrincipleResolver();
  principleResolver.registerAll(principlesResult.value.valid.map((v) => v.data));

  const personaResolver = new InMemoryPersonaResolver();
  personaResolver.registerAll(personasResult.value.valid.map((v) => v.data));

  // ペルソナを解決
  const personaId = options.persona.startsWith('persona:')
    ? options.persona
    : `persona:${options.persona}`;

  const personaResult = personaResolver.resolve(personaId);

  if (!personaResult.ok) {
    console.error(chalk.red(`ペルソナが見つかりません: ${personaId}`));
    console.log(chalk.gray('利用可能なペルソナ:'));
    for (const id of personaResolver.list()) {
      console.log(chalk.gray(`  - ${id}`));
    }
    process.exit(1);
  }

  const persona = personaResult.value.data;

  // ペルソナのデフォルト原則を解決
  const principleDefaults = persona.persona.defaults.principles ?? [];
  const principleRequests = principleDefaults.map((p) => ({
    id: p.id,
    enabled: p.enabled,
    weight: p.weight,
  }));

  const resolvedPrinciples = principleResolver.resolveAll(principleRequests);

  if (!resolvedPrinciples.ok) {
    console.error(chalk.red('原則の解決に失敗しました:'));
    for (const error of resolvedPrinciples.error) {
      console.error(chalk.red(`  - ${error.message}`));
    }
    process.exit(1);
  }

  // AGENTS.md を生成
  const generator = new DefaultAgentsGenerator();
  const result = generator.generate({
    persona,
    principles: resolvedPrinciples.value,
    projectName: options.projectName,
  });

  // ファイルに書き出し
  const outputPath = options.output ?? join(process.cwd(), 'AGENTS.generated.md');

  await writeFile(outputPath, result.content, 'utf-8');

  console.log('');
  console.log(chalk.green('✅ AGENTS.md を生成しました'));
  console.log(chalk.gray(`   出力先: ${outputPath}`));
  console.log(chalk.gray(`   ペルソナ: ${result.meta.personaId} (v${result.meta.personaVersion})`));
  console.log(chalk.gray(`   原則数: ${result.meta.principleCount}`));
  console.log(chalk.gray(`   生成日時: ${result.meta.generatedAt}`));
}

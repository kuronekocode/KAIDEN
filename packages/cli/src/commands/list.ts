/**
 * list コマンド
 * 利用可能なペルソナ・原則を一覧表示
 */

import { join } from 'node:path';
import chalk from 'chalk';
import {
  createDataValidator,
  type PrincipleFile,
  type PersonaFile,
} from '@kaiden/core';

interface ListOptions {
  readonly type: 'personas' | 'principles';
}

export async function listCommand(options: ListOptions): Promise<void> {
  const rootDir = join(process.cwd(), 'data');
  const schemasDir = join(rootDir, 'schemas');

  const validator = createDataValidator(schemasDir);

  if (options.type === 'personas') {
    await listPersonas(validator, rootDir);
  } else {
    await listPrinciples(validator, rootDir);
  }
}

async function listPersonas(
  validator: ReturnType<typeof createDataValidator>,
  rootDir: string
): Promise<void> {
  const result = await validator.validateDirectory<PersonaFile>({
    schemaType: 'persona',
    directory: join(rootDir, 'personas'),
  });

  if (!result.ok) {
    console.error(chalk.red(`エラー: ${result.error.message}`));
    process.exit(1);
  }

  console.log(chalk.blue('利用可能なペルソナ:\n'));

  for (const { data } of result.value.valid) {
    const icon = data.persona.icon ?? '👤';
    console.log(`${icon} ${chalk.cyan(data.meta.id)} (v${data.meta.version})`);
    console.log(chalk.gray(`   ${data.persona.name}`));
    console.log(chalk.gray(`   ${data.persona.description.split('\n')[0]}`));
    console.log('');
  }
}

async function listPrinciples(
  validator: ReturnType<typeof createDataValidator>,
  rootDir: string
): Promise<void> {
  const result = await validator.validateDirectory<PrincipleFile>({
    schemaType: 'principle',
    directory: join(rootDir, 'principles'),
  });

  if (!result.ok) {
    console.error(chalk.red(`エラー: ${result.error.message}`));
    process.exit(1);
  }

  console.log(chalk.blue('利用可能な原則:\n'));

  for (const { data } of result.value.valid) {
    const displayName = data.principle.nameJa ?? data.principle.name;
    console.log(`📋 ${chalk.cyan(data.meta.id)} (v${data.meta.version})`);
    console.log(chalk.gray(`   ${data.principle.name} - ${displayName}`));
    console.log(chalk.gray(`   ${data.principle.summary}`));

    if (data.principle.children && data.principle.children.length > 0) {
      console.log(chalk.gray(`   子原則: ${data.principle.children.map((c) => c.name).join(', ')}`));
    }

    console.log('');
  }
}

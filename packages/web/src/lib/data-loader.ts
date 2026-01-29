/**
 * データローダー
 * YAMLファイルを読み込んでパースする
 */

import { parse } from 'yaml';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PersonaFile, PrincipleFile } from '@kaiden/core';

// プロジェクトルートを取得
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../../../data');

/**
 * ペルソナデータを読み込む
 */
export function loadPersonas(lang: string = 'ja'): PersonaFile[] {
  const personasDir = join(dataDir, 'personas', lang);
  const files = readdirSync(personasDir).filter(f => f.endsWith('.yaml'));
  
  return files.map(file => {
    const content = readFileSync(join(personasDir, file), 'utf-8');
    return parse(content) as PersonaFile;
  });
}

/**
 * 原則データを読み込む
 */
export function loadPrinciples(lang: string = 'ja'): PrincipleFile[] {
  const principlesDir = join(dataDir, 'principles', lang);
  const files = readdirSync(principlesDir).filter(f => f.endsWith('.yaml'));
  
  return files.map(file => {
    const content = readFileSync(join(principlesDir, file), 'utf-8');
    return parse(content) as PrincipleFile;
  });
}

/**
 * 全データを読み込む
 */
export function loadAllData(lang: string = 'ja') {
  return {
    personas: loadPersonas(lang),
    principles: loadPrinciples(lang),
  };
}

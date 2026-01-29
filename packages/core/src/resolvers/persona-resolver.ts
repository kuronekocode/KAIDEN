/**
 * ペルソナリゾルバー
 * ペルソナデータの解決を担当（SRP）
 */

import * as semver from 'semver';
import type { Result } from '../types/index.js';
import { ok, err } from '../types/index.js';
import type { PersonaFile } from '../types/index.js';

/** 解決されたペルソナ */
export interface ResolvedPersona {
  readonly id: string;
  readonly version: string;
  readonly data: PersonaFile;
}

/** ペルソナ解決エラー */
export interface PersonaResolveError {
  readonly type: 'persona-resolve-error';
  readonly personaId: string;
  readonly message: string;
}

/**
 * ペルソナリゾルバーインターフェース（DIP）
 */
export interface PersonaResolver {
  resolve(personaId: string, versionRange?: string): Result<ResolvedPersona, PersonaResolveError>;
  list(): readonly string[];
}

/**
 * インメモリペルソナリゾルバー
 */
export class InMemoryPersonaResolver implements PersonaResolver {
  private readonly personas: Map<string, Map<string, PersonaFile>> = new Map();

  register(persona: PersonaFile): void {
    const id = persona.meta.id;
    const version = persona.meta.version;

    if (!this.personas.has(id)) {
      this.personas.set(id, new Map());
    }

    this.personas.get(id)!.set(version, persona);
  }

  registerAll(personas: readonly PersonaFile[]): void {
    for (const persona of personas) {
      this.register(persona);
    }
  }

  resolve(personaId: string, versionRange?: string): Result<ResolvedPersona, PersonaResolveError> {
    const versions = this.personas.get(personaId);

    if (!versions || versions.size === 0) {
      return err({
        type: 'persona-resolve-error',
        personaId,
        message: `Persona not found: ${personaId}`,
      });
    }

    const availableVersions = Array.from(versions.keys()).sort(semver.rcompare);
    const range = versionRange ?? '*';

    const matchingVersion = availableVersions.find((v) => semver.satisfies(v, range));

    if (!matchingVersion) {
      return err({
        type: 'persona-resolve-error',
        personaId,
        message: `No version matching "${range}" for ${personaId}. Available: ${availableVersions.join(', ')}`,
      });
    }

    const data = versions.get(matchingVersion)!;

    return ok({
      id: personaId,
      version: matchingVersion,
      data,
    });
  }

  list(): readonly string[] {
    return Array.from(this.personas.keys());
  }
}

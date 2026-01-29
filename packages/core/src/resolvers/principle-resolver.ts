/**
 * 原則リゾルバー
 * 原則データの解決を担当（SRP）
 */

import * as semver from 'semver';
import type { Result } from '../types/index.js';
import { ok, err } from '../types/index.js';
import type { PrincipleFile } from '../types/index.js';

/** 解決された原則 */
export interface ResolvedPrinciple {
  readonly id: string;
  readonly version: string;
  readonly data: PrincipleFile;
  readonly enabled: boolean;
  readonly weight: number;
}

/** バージョン解決エラー */
export interface VersionResolveError {
  readonly type: 'version-resolve-error';
  readonly principleId: string;
  readonly requestedRange: string;
  readonly availableVersions: readonly string[];
  readonly message: string;
}

/** 原則が見つからないエラー */
export interface PrincipleNotFoundError {
  readonly type: 'principle-not-found';
  readonly principleId: string;
  readonly message: string;
}

export type ResolveError = VersionResolveError | PrincipleNotFoundError;

/**
 * 原則リゾルバーインターフェース（DIP）
 */
export interface PrincipleResolver {
  resolve(
    principleId: string,
    versionRange?: string
  ): Result<ResolvedPrinciple, ResolveError>;

  resolveAll(
    requests: ReadonlyArray<{ id: string; versionRange?: string; enabled?: boolean; weight?: number }>
  ): Result<readonly ResolvedPrinciple[], readonly ResolveError[]>;
}

/**
 * インメモリ原則リゾルバー
 * 原則データをメモリ上のMapから解決
 */
export class InMemoryPrincipleResolver implements PrincipleResolver {
  /** id -> version -> data のネストされたMap */
  private readonly principles: Map<string, Map<string, PrincipleFile>> = new Map();

  /**
   * 原則データを登録
   */
  register(principle: PrincipleFile): void {
    const id = principle.meta.id;
    const version = principle.meta.version;

    if (!this.principles.has(id)) {
      this.principles.set(id, new Map());
    }

    this.principles.get(id)!.set(version, principle);
  }

  /**
   * 複数の原則データを一括登録
   */
  registerAll(principles: readonly PrincipleFile[]): void {
    for (const principle of principles) {
      this.register(principle);
    }
  }

  resolve(
    principleId: string,
    versionRange?: string
  ): Result<ResolvedPrinciple, ResolveError> {
    const versions = this.principles.get(principleId);

    if (!versions || versions.size === 0) {
      return err({
        type: 'principle-not-found',
        principleId,
        message: `Principle not found: ${principleId}`,
      });
    }

    const availableVersions = Array.from(versions.keys()).sort(semver.rcompare);
    const range = versionRange ?? '*';

    // バージョン範囲にマッチする最新版を探す
    const matchingVersion = availableVersions.find((v) => semver.satisfies(v, range));

    if (!matchingVersion) {
      return err({
        type: 'version-resolve-error',
        principleId,
        requestedRange: range,
        availableVersions,
        message: `No version matching "${range}" for ${principleId}. Available: ${availableVersions.join(', ')}`,
      });
    }

    const data = versions.get(matchingVersion)!;

    return ok({
      id: principleId,
      version: matchingVersion,
      data,
      enabled: true,
      weight: 1.0,
    });
  }

  resolveAll(
    requests: ReadonlyArray<{ id: string; versionRange?: string; enabled?: boolean; weight?: number }>
  ): Result<readonly ResolvedPrinciple[], readonly ResolveError[]> {
    const resolved: ResolvedPrinciple[] = [];
    const errors: ResolveError[] = [];

    for (const request of requests) {
      const result = this.resolve(request.id, request.versionRange);

      if (result.ok) {
        resolved.push({
          ...result.value,
          enabled: request.enabled ?? true,
          weight: request.weight ?? 1.0,
        });
      } else {
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      return err(errors);
    }

    return ok(resolved);
  }
}

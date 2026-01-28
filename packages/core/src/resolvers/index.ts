/**
 * リゾルバーのエクスポート
 */

export type {
  ResolvedPrinciple,
  VersionResolveError,
  PrincipleNotFoundError,
  ResolveError,
  PrincipleResolver,
} from './principle-resolver.js';
export { InMemoryPrincipleResolver } from './principle-resolver.js';

export type {
  ResolvedPersona,
  PersonaResolveError,
  PersonaResolver,
} from './persona-resolver.js';
export { InMemoryPersonaResolver } from './persona-resolver.js';

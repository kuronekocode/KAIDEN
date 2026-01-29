/**
 * Astro Content Collections Configuration
 * data/ ディレクトリのYAMLファイルを管理
 */

import { defineCollection, z } from 'astro:content';

// 原則スキーマ
const principleCollection = defineCollection({
  type: 'data',
  schema: z.object({
    $schema: z.string().optional(),
    meta: z.object({
      id: z.string(),
      version: z.string(),
      lang: z.enum(['ja', 'en']),
      license: z.string(),
      lastUpdated: z.string(),
    }),
    principle: z.object({
      name: z.string(),
      nameJa: z.string().optional(),
      category: z.string(),
      summary: z.string(),
      description: z.string().optional(),
      triggerTokens: z.array(z.string()).optional(),
      promptFragment: z.string().optional(),
      children: z.array(z.object({
        id: z.string(),
        name: z.string(),
        nameJa: z.string().optional(),
        description: z.string().optional(),
        promptFragment: z.string(),
      })).optional(),
      tensions: z.array(z.object({
        with: z.string(),
        description: z.string(),
        severity: z.enum(['low', 'medium', 'high']),
      })).optional(),
      recommendedFor: z.array(z.object({
        persona: z.string(),
        weight: z.number(),
      })).optional(),
      references: z.array(z.object({
        title: z.string(),
        url: z.string(),
        author: z.string().optional(),
        year: z.number().optional(),
      })).optional(),
    }),
  }),
});

// ペルソナスキーマ
const personaCollection = defineCollection({
  type: 'data',
  schema: z.object({
    $schema: z.string().optional(),
    meta: z.object({
      id: z.string(),
      version: z.string(),
      lang: z.enum(['ja', 'en']),
      changelog: z.array(z.object({
        version: z.string(),
        date: z.string(),
        changes: z.array(z.string()),
      })).optional(),
    }),
    persona: z.object({
      name: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      defaults: z.object({
        principles: z.array(z.object({
          id: z.string(),
          enabled: z.boolean(),
          weight: z.number(),
        })).optional(),
        style: z.object({
          verbosity: z.enum(['minimal', 'normal', 'detailed']).optional(),
          tone: z.string().optional(),
          focusAreas: z.array(z.string()).optional(),
        }).optional(),
      }),
      dependencies: z.object({
        principles: z.record(z.string()).optional(),
      }).optional(),
    }),
  }),
});

export const collections = {
  principles: principleCollection,
  personas: personaCollection,
};

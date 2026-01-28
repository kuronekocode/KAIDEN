# kaiden スキーマ定義

## 概要

kaidenのデータファイルはYAML形式で記述し、JSON Schemaで検証します。

## スキーマファイル

### data/schemas/principle.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/kuronekocode/kaiden/schemas/principle.schema.json",
  "title": "Principle",
  "description": "設計原則の定義",
  "type": "object",
  "required": ["meta", "principle"],
  "properties": {
    "$schema": {
      "type": "string"
    },
    "meta": {
      "$ref": "#/$defs/Meta"
    },
    "principle": {
      "$ref": "#/$defs/PrincipleData"
    }
  },
  "$defs": {
    "Meta": {
      "type": "object",
      "required": ["id", "version", "lang", "license", "lastUpdated"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^principle:[a-z][a-z0-9-]*$",
          "description": "一意識別子（例: principle:solid）"
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$",
          "description": "セマンティックバージョン"
        },
        "lang": {
          "type": "string",
          "enum": ["ja", "en"],
          "description": "言語コード"
        },
        "license": {
          "type": "string",
          "description": "ライセンス（例: CC-BY-4.0）"
        },
        "lastUpdated": {
          "type": "string",
          "format": "date",
          "description": "最終更新日（ISO 8601）"
        }
      }
    },
    "PrincipleData": {
      "type": "object",
      "required": ["name", "category", "summary"],
      "properties": {
        "name": {
          "type": "string",
          "description": "原則名（英語）"
        },
        "nameJa": {
          "type": "string",
          "description": "原則名（日本語）"
        },
        "category": {
          "type": "string",
          "enum": [
            "object-oriented-design",
            "functional-design",
            "architecture",
            "coding-practice",
            "testing",
            "security"
          ]
        },
        "summary": {
          "type": "string",
          "description": "概要説明"
        },
        "description": {
          "type": "string",
          "description": "詳細説明"
        },
        "triggerTokens": {
          "type": "array",
          "items": { "type": "string" },
          "description": "推論誘導用のキーフレーズ"
        },
        "promptFragment": {
          "type": "string",
          "description": "AGENTS.md生成時に含める短い文"
        },
        "children": {
          "type": "array",
          "items": { "$ref": "#/$defs/ChildPrinciple" },
          "description": "子原則（階層構造）"
        },
        "tensions": {
          "type": "array",
          "items": { "$ref": "#/$defs/Tension" },
          "description": "他の原則との緊張関係"
        },
        "recommendedFor": {
          "type": "array",
          "items": { "$ref": "#/$defs/PersonaRecommendation" }
        },
        "references": {
          "type": "array",
          "items": { "$ref": "#/$defs/Reference" },
          "description": "参考文献・リンク"
        }
      }
    },
    "ChildPrinciple": {
      "type": "object",
      "required": ["id", "name", "promptFragment"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^principle:[a-z][a-z0-9-]*$"
        },
        "name": {
          "type": "string"
        },
        "nameJa": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "promptFragment": {
          "type": "string"
        }
      }
    },
    "Tension": {
      "type": "object",
      "required": ["with", "description", "severity"],
      "properties": {
        "with": {
          "type": "string",
          "pattern": "^principle:[a-z][a-z0-9-]*$",
          "description": "緊張関係にある原則ID"
        },
        "description": {
          "type": "string",
          "description": "緊張関係の説明"
        },
        "severity": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        }
      }
    },
    "PersonaRecommendation": {
      "type": "object",
      "required": ["persona", "weight"],
      "properties": {
        "persona": {
          "type": "string",
          "description": "ペルソナID（persona:プレフィックスなし）"
        },
        "weight": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "推奨度（0.0〜1.0）"
        }
      }
    },
    "Reference": {
      "type": "object",
      "required": ["title", "url"],
      "properties": {
        "title": { "type": "string" },
        "url": { "type": "string", "format": "uri" },
        "author": { "type": "string" },
        "year": { "type": "integer" }
      }
    }
  }
}
```

### data/schemas/persona.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/kuronekocode/kaiden/schemas/persona.schema.json",
  "title": "Persona",
  "description": "エージェントペルソナの定義",
  "type": "object",
  "required": ["meta", "persona"],
  "properties": {
    "$schema": { "type": "string" },
    "meta": { "$ref": "#/$defs/Meta" },
    "persona": { "$ref": "#/$defs/PersonaData" }
  },
  "$defs": {
    "Meta": {
      "type": "object",
      "required": ["id", "version", "lang"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^persona:[a-z][a-z0-9-]*$"
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        },
        "lang": {
          "type": "string",
          "enum": ["ja", "en"]
        },
        "changelog": {
          "type": "array",
          "items": { "$ref": "#/$defs/ChangelogEntry" }
        }
      }
    },
    "ChangelogEntry": {
      "type": "object",
      "required": ["version", "date", "changes"],
      "properties": {
        "version": { "type": "string" },
        "date": { "type": "string", "format": "date" },
        "changes": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "PersonaData": {
      "type": "object",
      "required": ["name", "description", "defaults"],
      "properties": {
        "name": {
          "type": "string",
          "description": "ペルソナ名"
        },
        "description": {
          "type": "string",
          "description": "ペルソナの説明"
        },
        "icon": {
          "type": "string",
          "description": "表示用アイコン（絵文字）"
        },
        "defaults": {
          "$ref": "#/$defs/Defaults"
        },
        "dependencies": {
          "$ref": "#/$defs/Dependencies"
        }
      }
    },
    "Defaults": {
      "type": "object",
      "properties": {
        "principles": {
          "type": "array",
          "items": { "$ref": "#/$defs/PrincipleDefault" }
        },
        "style": { "$ref": "#/$defs/Style" }
      }
    },
    "PrincipleDefault": {
      "type": "object",
      "required": ["id", "enabled"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^principle:[a-z][a-z0-9-]*$"
        },
        "enabled": { "type": "boolean" },
        "weight": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        }
      }
    },
    "Style": {
      "type": "object",
      "properties": {
        "verbosity": {
          "type": "string",
          "enum": ["minimal", "standard", "detailed"]
        },
        "tone": {
          "type": "string",
          "enum": ["friendly", "neutral", "analytical"]
        },
        "focusAreas": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "Dependencies": {
      "type": "object",
      "properties": {
        "principles": {
          "type": "object",
          "additionalProperties": {
            "type": "string",
            "description": "semver範囲（例: >=1.0.0 <2.0.0）"
          }
        }
      }
    }
  }
}
```

### data/schemas/mcp.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/kuronekocode/kaiden/schemas/mcp.schema.json",
  "title": "MCP",
  "description": "Model Context Protocol サーバー定義",
  "type": "object",
  "required": ["meta", "mcp"],
  "properties": {
    "$schema": { "type": "string" },
    "meta": { "$ref": "#/$defs/Meta" },
    "mcp": { "$ref": "#/$defs/MCPData" }
  },
  "$defs": {
    "Meta": {
      "type": "object",
      "required": ["id", "version", "sourceUrl", "lastChecked"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^mcp:[a-z][a-z0-9-]*$"
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        },
        "sourceUrl": {
          "type": "string",
          "format": "uri"
        },
        "lastChecked": {
          "type": "string",
          "format": "date"
        },
        "checksum": {
          "type": "string",
          "description": "ソース変更検知用ハッシュ"
        }
      }
    },
    "MCPData": {
      "type": "object",
      "required": ["name", "displayName", "description", "category"],
      "properties": {
        "name": {
          "type": "string",
          "description": "パッケージ名（npm）"
        },
        "displayName": {
          "type": "string",
          "description": "表示名（日本語）"
        },
        "description": {
          "type": "string"
        },
        "category": {
          "type": "string",
          "enum": ["system", "web", "database", "ai", "productivity", "development"]
        },
        "setup": { "$ref": "#/$defs/Setup" },
        "links": { "$ref": "#/$defs/Links" },
        "tools": {
          "type": "array",
          "items": { "$ref": "#/$defs/Tool" }
        }
      }
    },
    "Setup": {
      "type": "object",
      "properties": {
        "authRequired": { "type": "boolean" },
        "envVariables": {
          "type": "array",
          "items": { "$ref": "#/$defs/EnvVariable" }
        },
        "configTemplate": {
          "type": "string",
          "description": "JSON設定テンプレート"
        },
        "variables": {
          "type": "array",
          "items": { "$ref": "#/$defs/ConfigVariable" }
        }
      }
    },
    "EnvVariable": {
      "type": "object",
      "required": ["name", "description"],
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" },
        "required": { "type": "boolean" },
        "sensitive": { "type": "boolean" }
      }
    },
    "ConfigVariable": {
      "type": "object",
      "required": ["name", "description", "required"],
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" },
        "required": { "type": "boolean" },
        "default": { "type": "string" }
      }
    },
    "Links": {
      "type": "object",
      "properties": {
        "docs": { "type": "string", "format": "uri" },
        "npm": { "type": "string", "format": "uri" },
        "github": { "type": "string", "format": "uri" },
        "changelog": { "type": "string", "format": "uri" },
        "auth": {
          "type": "string",
          "format": "uri",
          "description": "認証設定ページへのリンク"
        }
      }
    },
    "Tool": {
      "type": "object",
      "required": ["name", "description"],
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" }
      }
    }
  }
}
```

## TypeScript型生成

JSON Schemaから TypeScript の型定義を自動生成します。

### 生成コマンド

```bash
npx json-schema-to-typescript \
  data/schemas/principle.schema.json \
  -o packages/core/src/types/principle.ts

npx json-schema-to-typescript \
  data/schemas/persona.schema.json \
  -o packages/core/src/types/persona.ts

npx json-schema-to-typescript \
  data/schemas/mcp.schema.json \
  -o packages/core/src/types/mcp.ts
```

### package.json スクリプト

```json
{
  "scripts": {
    "generate:types": "npm-run-all generate:types:*",
    "generate:types:principle": "json2ts data/schemas/principle.schema.json -o packages/core/src/types/principle.ts",
    "generate:types:persona": "json2ts data/schemas/persona.schema.json -o packages/core/src/types/persona.ts",
    "generate:types:mcp": "json2ts data/schemas/mcp.schema.json -o packages/core/src/types/mcp.ts"
  }
}
```

## バリデーション

### CI での検証

```yaml
# .github/workflows/validate.yml
name: Validate Data Files

on:
  push:
    paths:
      - 'data/**/*.yaml'
      - 'data/schemas/**/*.json'
  pull_request:
    paths:
      - 'data/**/*.yaml'
      - 'data/schemas/**/*.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Validate schemas
        run: npm run validate:schemas
        
      - name: Validate data files
        run: npm run validate:data
```

### バリデーションスクリプト

```typescript
// scripts/validate.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { parse } from 'yaml';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

async function validateDataFiles() {
  const schemas = {
    principle: await loadSchema('data/schemas/principle.schema.json'),
    persona: await loadSchema('data/schemas/persona.schema.json'),
    mcp: await loadSchema('data/schemas/mcp.schema.json'),
  };
  
  const validators = {
    principle: ajv.compile(schemas.principle),
    persona: ajv.compile(schemas.persona),
    mcp: ajv.compile(schemas.mcp),
  };
  
  const errors: string[] = [];
  
  // Principles
  for (const file of await glob('data/principles/**/*.yaml')) {
    const data = parse(await readFile(file, 'utf-8'));
    if (!validators.principle(data)) {
      errors.push(`${file}: ${ajv.errorsText(validators.principle.errors)}`);
    }
  }
  
  // Personas
  for (const file of await glob('data/personas/**/*.yaml')) {
    const data = parse(await readFile(file, 'utf-8'));
    if (!validators.persona(data)) {
      errors.push(`${file}: ${ajv.errorsText(validators.persona.errors)}`);
    }
  }
  
  // MCPs
  for (const file of await glob('data/mcps/**/*.yaml')) {
    const data = parse(await readFile(file, 'utf-8'));
    if (!validators.mcp(data)) {
      errors.push(`${file}: ${ajv.errorsText(validators.mcp.errors)}`);
    }
  }
  
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
  
  console.log('All data files are valid!');
}

validateDataFiles();
```

# Types

Public TypeScript type definitions exported by the plugin.

## Exported Types

This directory re-exports types from the Elasticsearch module for external use:

- `ElasticsearchPluginOptions` -- Configuration options for the module (client config + index settings)
- `IndexConfig` -- Per-index configuration (mappings, settings, transformer)
- `SearchOptions` -- Search query options (pagination, filter, additional options)
- `ElasticIndexSettings` -- Elasticsearch-specific index settings (mappings, index settings)

## Usage

When using this plugin in a Medusa application, you can import types for type-safe configuration:

```ts
import type { ElasticsearchPluginOptions } from 'medusa-plugin-elasticsearch/types'
```

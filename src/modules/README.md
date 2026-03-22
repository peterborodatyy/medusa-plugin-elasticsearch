# Elasticsearch Module

A module is a package of reusable functionalities. It can be integrated into your Medusa application without affecting the overall system.

Learn more about modules in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules).

## Elasticsearch Module Service

The Elasticsearch module provides a service that wraps the Elasticsearch Node.js client, offering methods for indexing, searching, and managing documents.

The module is defined in `src/modules/elasticsearch/index.ts`:

```ts
import { Module } from '@medusajs/framework/utils'
import ElasticsearchModuleService from './service'

export const ELASTICSEARCH_MODULE = 'elasticsearch'

export default Module(ELASTICSEARCH_MODULE, {
  service: ElasticsearchModuleService,
})
```

## Service Methods

The `ElasticsearchModuleService` exposes the following methods:

- `indexData(documents, type)` -- Bulk index documents into an Elasticsearch index
- `search(query, type, options)` -- Full-text search with pagination and filters
- `retrieveFromIndex(objectIDs, type)` -- Retrieve documents by their IDs
- `deleteFromIndex(objectIDs, type)` -- Remove documents from an index
- `deleteAllDocuments(type)` -- Remove all documents from an index
- `createIndex(indexName, options)` -- Create a new Elasticsearch index
- `getIndex(indexName)` -- Retrieve index metadata
- `updateSettings(indexName, config)` -- Recreate an index with updated mappings/settings
- `initializeIndexes()` -- Create/update all configured indexes on startup

## Using the Module

You can resolve the module in API routes, subscribers, workflows, or any other customization:

```ts
import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ELASTICSEARCH_MODULE } from '../../modules/elasticsearch'
import type ElasticsearchModuleService from '../../modules/elasticsearch/service'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const elasticsearchService: ElasticsearchModuleService =
    req.scope.resolve(ELASTICSEARCH_MODULE)

  const results = await elasticsearchService.search('sweatshirt', 'products', {
    paginationOptions: { offset: 0, limit: 20 },
  })

  res.json(results)
}
```

## Module Options

The module accepts options when registered in `medusa-config.ts`:

```ts
module.exports = defineConfig({
  modules: [
    {
      resolve: 'medusa-plugin-elasticsearch/modules/elasticsearch',
      options: {
        config: {
          cloud: { id: process.env.ELASTIC_CLOUD_ID },
          auth: {
            username: process.env.ELASTIC_USER_NAME,
            password: process.env.ELASTIC_PASSWORD,
          },
        },
        settings: {
          products: {
            mappings: { /* ... */ },
            settings: { /* ... */ },
            transformer: (product) => ({ /* ... */ }),
          },
          categories: {
            mappings: { /* ... */ },
          },
        },
      },
    },
  ],
})
```

Learn more about module options in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/options).

## Index Initialization

The module includes a loader (`loaders/initialize.ts`) that runs on startup. It creates or recreates all configured indexes with their mappings and settings.

# Workflows

A workflow is a series of steps that are executed in sequence. Each step can have a compensation function that rolls back its changes if a later step fails.

Learn more about workflows in [this documentation](https://docs.medusajs.com/learn/fundamentals/workflows).

## Plugin Workflows

This plugin defines the following workflows:

### Sync Products (`sync-products-to-elasticsearch.ts`)

Fetches products by ID via the Query API and indexes them in Elasticsearch. Published products are indexed; unpublished products are removed from the index.

**Steps:**
1. `fetch-products-for-es` -- Fetches full product data (title, description, variants, tags, categories, etc.)
2. `index-products-in-es` -- Indexes published products and removes unpublished ones. Includes compensation to rollback on failure.

```ts
import { syncProductsToElasticsearchWorkflow } from '../workflows'

await syncProductsToElasticsearchWorkflow(container).run({
  input: { ids: ['prod_01ABC', 'prod_02DEF'] },
})
```

### Delete Products (`delete-products-from-elasticsearch.ts`)

Removes products from the Elasticsearch index by their IDs.

```ts
import { deleteProductsFromElasticsearchWorkflow } from '../workflows'

await deleteProductsFromElasticsearchWorkflow(container).run({
  input: { ids: ['prod_01ABC'] },
})
```

### Sync Categories (`sync-categories-to-elasticsearch.ts`)

Fetches product categories by ID and indexes them in Elasticsearch. Only active, non-internal categories are indexed; inactive or internal categories are removed.

**Steps:**
1. `fetch-categories-for-es` -- Fetches category data (name, handle, description, parent, children, etc.)
2. `index-categories-in-es` -- Indexes active categories and removes inactive ones. Includes compensation to rollback on failure.

```ts
import { syncCategoriesToElasticsearchWorkflow } from '../workflows'

await syncCategoriesToElasticsearchWorkflow(container).run({
  input: { ids: ['pcat_01ABC'] },
})
```

### Delete Categories (`delete-categories-from-elasticsearch.ts`)

Removes categories from the Elasticsearch index by their IDs.

```ts
import { deleteCategoriesFromElasticsearchWorkflow } from '../workflows'

await deleteCategoriesFromElasticsearchWorkflow(container).run({
  input: { ids: ['pcat_01ABC'] },
})
```

## Workflow Compensation

The sync workflows include compensation logic. If the indexing step fails, the compensation function automatically removes any documents that were indexed during that step, ensuring the index remains consistent.

## Using Workflows Externally

All workflows are exported from the `workflows/index.ts` barrel file. When using this plugin in a Medusa application, import them from:

```ts
import {
  syncProductsToElasticsearchWorkflow,
  deleteProductsFromElasticsearchWorkflow,
  syncCategoriesToElasticsearchWorkflow,
  deleteCategoriesFromElasticsearchWorkflow,
} from 'medusa-plugin-elasticsearch/workflows'
```

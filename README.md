<p align="center">
  <img src="https://images.contentstack.io/v3/assets/bltefdd0b53724fa2ce/blt280217a63b82a734/6202d3378b1f312528798412/elastic-logo.svg" width="200" height="auto" />
</p>

# Medusa Elasticsearch Plugin

<p>
	<a href="https://www.npmjs.com/package/medusa-plugin-elasticsearch"><img alt="NPM Version" src="https://img.shields.io/npm/v/medusa-plugin-elasticsearch.svg" height="20"/></a>
	<a href="https://www.npmjs.com/package/medusa-plugin-elasticsearch"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/medusa-plugin-elasticsearch.svg" height="20"/></a>
	<a href="https://github.com/peterborodatyy/medusa-plugin-elasticsearch"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/peterborodatyy/medusa-plugin-elasticsearch?style=flat" height="20"/></a>
	<a href="https://github.com/peterborodatyy/medusa-plugin-elasticsearch/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/peterborodatyy/medusa-plugin-elasticsearch" height="20"/></a>
	<a href="https://github.com/peterborodatyy/medusa-plugin-elasticsearch/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/peterborodatyy/medusa-plugin-elasticsearch.svg" height="20"/></a>
	<a href="https://github.com/peterborodatyy/medusa-plugin-elasticsearch/issues"><img alt="Issues" src="https://img.shields.io/github/issues/peterborodatyy/medusa-plugin-elasticsearch?style=flat" height="20"/></a>
	<a href="https://x.com/intent/tweet?text=Checkout%20the%20Medusa.js%20Elasticsearch%20plugin%20for%20v2&url=https://github.com/peterborodatyy/medusa-plugin-elasticsearch&hashtags=medusa,elastic,elasticsearch"><img alt="Share on X" src="https://img.shields.io/badge/share-on%20X-black?logo=x&logoColor=white" height="20"/></a>
</p>

Elasticsearch search plugin for **Medusa v2**. Provides automatic product and category indexing, full-text search, and admin sync capabilities powered by Elasticsearch.

## Features

- **Product and category indexing** with real-time sync on create, update, and delete events
- **Full reindex** via admin API endpoint or scheduled job (daily at midnight)
- **Batch syncing** with pagination (50 items per batch) for large catalogs
- **Smart filtering** -- only published products and active/non-internal categories are indexed
- **Custom document transformers** per index type
- **Configurable Elasticsearch mappings**, analyzers, and tokenizers
- **Search API** for products (`POST /store/products/search`) and categories (`POST /store/categories/search`)
- **Admin API** at `POST /admin/elasticsearch/sync` with authentication
- **Admin UI** settings page at `/settings/elasticsearch` with sync button and search testing
- **Workflow compensation** -- automatic rollback on indexing failures
- Built as a Medusa v2 module with workflows, subscribers, and scheduled jobs

---

## Prerequisites

- [Medusa v2](https://docs.medusajs.com/) application (v2.5.0+)
- Elasticsearch instance or [Elastic Cloud](https://www.elastic.co/cloud)

---

## Installation

1\. Install the plugin in your Medusa project:

```bash
npm install medusa-plugin-elasticsearch
```

2\. Set environment variables in `.env`:

```bash
ELASTIC_CLOUD_ID=your_cloud_id
ELASTIC_USER_NAME=your_username
ELASTIC_PASSWORD=your_password
```

Or for a local Elasticsearch instance:

```bash
ELASTIC_NODE=http://localhost:9200
```

3\. Register the plugin and module in `medusa-config.ts`:

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  // Register the plugin (loads subscribers, API routes, workflows, jobs)
  plugins: [
    {
      resolve: "medusa-plugin-elasticsearch",
      options: {},
    },
  ],
  // Register the Elasticsearch module
  modules: [
    {
      resolve: "medusa-plugin-elasticsearch/modules/elasticsearch",
      options: {
        config: {
          // Option A: Elastic Cloud
          cloud: {
            id: process.env.ELASTIC_CLOUD_ID,
          },
          auth: {
            username: process.env.ELASTIC_USER_NAME,
            password: process.env.ELASTIC_PASSWORD,
          },
          // Option B: Local instance
          // node: process.env.ELASTIC_NODE,
        },
        settings: {
          products: {
            // Optional: custom Elasticsearch mappings
            mappings: {
              properties: {
                id: { type: "keyword" },
                title: { type: "text" },
                description: { type: "text" },
                handle: { type: "keyword" },
              },
            },
            // Optional: custom index settings (analyzers, tokenizers)
            settings: {
              analysis: {
                tokenizer: {
                  autocomplete: {
                    type: "edge_ngram",
                    min_gram: 2,
                    max_gram: 10,
                    token_chars: ["letter", "digit"],
                  },
                },
                analyzer: {
                  autocomplete_index: {
                    type: "custom",
                    tokenizer: "autocomplete",
                    filter: ["lowercase"],
                  },
                },
              },
            },
          },
          categories: {
            mappings: {
              properties: {
                id: { type: "keyword" },
                name: { type: "text" },
                handle: { type: "keyword" },
                description: { type: "text" },
              },
            },
          },
        },
      },
    },
  ],
})
```

---

## Options

### Module Options

| Name | Description | Required |
|------|-------------|----------|
| `config` | Elasticsearch [client configuration](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-configuration.html) (cloud, auth, node, etc.) | true |
| `settings` | Index configurations keyed by index name (`products`, `categories`, or custom) | false |

### Index Options (per index in `settings`)

| Name | Description | Required |
|------|-------------|----------|
| `transformer` | Custom document transformer function | false |
| `mappings` | Elasticsearch [mapping configuration](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html) | false |
| `settings` | Elasticsearch [index settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html) (analyzers, tokenizers, normalizers) | false |

---

## API Endpoints

### Store: Search Products

```
POST /store/products/search
```

Search products indexed in Elasticsearch. No authentication required.

**Request body:**

```json
{
  "q": "sweatshirt",
  "offset": 0,
  "limit": 20,
  "filter": {}
}
```

### Store: Search Categories

```
POST /store/categories/search
```

Search product categories. No authentication required.

**Request body:**

```json
{
  "q": "electronics",
  "offset": 0,
  "limit": 20
}
```

**Response:** Standard Elasticsearch search response with `hits`.

### Admin: Trigger Full Sync

```
POST /admin/elasticsearch/sync
```

Triggers a full reindex of all products and categories. Requires admin authentication (session, bearer, or API key).

**Response:**

```json
{
  "message": "Syncing products to Elasticsearch"
}
```

The sync runs asynchronously, processing items in batches of 50.

---

## Automatic Syncing

### Real-time Events

The plugin automatically syncs on these events:

**Products:**
- `product.created` -- indexes the new product
- `product.updated` -- re-indexes the updated product
- `product.deleted` -- removes the product from the index

**Categories:**
- `product-category.created` -- indexes the new category
- `product-category.updated` -- re-indexes the updated category
- `product-category.deleted` -- removes the category from the index

### Indexing Rules

- **Products**: Only `published` products are indexed. Draft/unpublished products are removed from the index.
- **Categories**: Only `is_active: true` and `is_internal: false` categories are indexed. Inactive or internal categories are removed.

### Scheduled Reindex

A scheduled job runs daily at midnight to trigger a full reindex via the `elasticsearch.sync` event.

### Manual Reindex

Use the admin API endpoint or emit the event directly:

```ts
const eventBus = container.resolve("event_bus")
await eventBus.emit({ name: "elasticsearch.sync", data: {} })
```

---

## Workflows

The plugin exports workflows for direct use:

```ts
import {
  syncProductsToElasticsearchWorkflow,
  deleteProductsFromElasticsearchWorkflow,
  syncCategoriesToElasticsearchWorkflow,
  deleteCategoriesFromElasticsearchWorkflow,
} from "medusa-plugin-elasticsearch/workflows"

// Sync specific products
await syncProductsToElasticsearchWorkflow(container).run({
  input: { ids: ["prod_01ABC"] },
})

// Sync specific categories
await syncCategoriesToElasticsearchWorkflow(container).run({
  input: { ids: ["pcat_01ABC"] },
})

// Delete from index
await deleteProductsFromElasticsearchWorkflow(container).run({
  input: { ids: ["prod_01ABC"] },
})

await deleteCategoriesFromElasticsearchWorkflow(container).run({
  input: { ids: ["pcat_01ABC"] },
})
```

---

## Custom Transformer

By default, products are indexed with a built-in transformer that flattens variant data, tags, categories, and collections. Categories are indexed with parent/children metadata. You can override either:

```ts
{
  settings: {
    products: {
      transformer: (product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        handle: product.handle,
        thumbnail: product.thumbnail,
      }),
    },
    categories: {
      transformer: (category) => ({
        id: category.id,
        name: category.name,
        handle: category.handle,
      }),
    },
  },
}
```

---

## Architecture

```
src/
  admin/                        # Admin UI extension
    lib/sdk.ts                  # Medusa JS SDK client
    routes/settings/elasticsearch/
      page.tsx                  # Settings page (sync + search testing)
  modules/elasticsearch/        # Elasticsearch module
    index.ts                    # Module definition (Module())
    service.ts                  # ES client service
    types.ts                    # Type definitions
    loaders/initialize.ts       # Index initialization on startup
  subscribers/
    product-upsert.ts           # Sync on product.created / product.updated
    product-deleted.ts          # Remove on product.deleted
    category-upsert.ts          # Sync on product-category.created / updated
    category-deleted.ts         # Remove on product-category.deleted
    elasticsearch-sync.ts       # Full reindex (products + categories)
  workflows/
    sync-products-to-elasticsearch.ts       # Fetch + index products
    delete-products-from-elasticsearch.ts   # Delete products from index
    sync-categories-to-elasticsearch.ts     # Fetch + index categories
    delete-categories-from-elasticsearch.ts # Delete categories from index
    index.ts                                # Workflow exports
  api/
    middlewares.ts              # Validation + admin auth
    store/products/search/      # POST /store/products/search
    store/categories/search/    # POST /store/categories/search
    admin/elasticsearch/sync/   # POST /admin/elasticsearch/sync
  jobs/
    elasticsearch-reindex.ts    # Daily scheduled reindex
  utils/
    transformer.ts              # Default product + category transformers
  types/
    index.ts                    # Public type exports
```

---

## Roadmap

Planned features for future releases:

- [ ] **i18n / multi-language support** -- index per locale or field-suffix strategy for multilingual storefronts
- [x] ~~**Admin UI extension** -- dashboard widget with sync button, index status, and document counts~~
- [ ] **Configurable reindex schedule** -- allow custom cron expressions via module options
- [ ] **Collection indexing** -- sync product collections alongside products and categories
- [ ] **Aggregation helpers** -- pre-built faceted search support (price ranges, categories, tags)
- [ ] **Geo-search support** -- location-based product search leveraging Elasticsearch's geo queries
- [ ] **Index aliasing** -- zero-downtime reindexing using Elasticsearch index aliases
- [ ] **Bulk reindex CLI command** -- one-time full reindex via Medusa CLI

---

## Additional Resources

- [Medusa v2 Documentation](https://docs.medusajs.com/)
- [Medusa Plugin Guide](https://docs.medusajs.com/learn/fundamentals/plugins)
- [Elasticsearch Node.js Client](https://github.com/elastic/elasticsearch-js)
- [Elasticsearch Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

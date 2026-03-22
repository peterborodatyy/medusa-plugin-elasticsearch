# Subscribers

A subscriber is a function executed when an event is emitted. It is used to implement asynchronous logic triggered by changes in the Medusa application.

A subscriber is created in a TypeScript or JavaScript file under the `src/subscribers` directory.

Learn more about subscribers in [this documentation](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers).

## Plugin Subscribers

This plugin defines the following subscribers:

### Product Upsert (`product-upsert.ts`)

Listens to `product.created` and `product.updated` events. Triggers the `syncProductsToElasticsearchWorkflow` to index the product.

```ts
import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { syncProductsToElasticsearchWorkflow } from '../workflows'

export default async function handleProductUpsert({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await syncProductsToElasticsearchWorkflow(container).run({
    input: { ids: [data.id] },
  })
}

export const config: SubscriberConfig = {
  event: ['product.created', 'product.updated'],
}
```

### Product Deleted (`product-deleted.ts`)

Listens to `product.deleted`. Triggers the `deleteProductsFromElasticsearchWorkflow` to remove the product from the index.

### Category Upsert (`category-upsert.ts`)

Listens to `product-category.created` and `product-category.updated`. Triggers the `syncCategoriesToElasticsearchWorkflow` to index the category.

### Category Deleted (`category-deleted.ts`)

Listens to `product-category.deleted`. Triggers the `deleteCategoriesFromElasticsearchWorkflow` to remove the category from the index.

### Full Sync (`elasticsearch-sync.ts`)

Listens to the custom `elasticsearch.sync` event. Performs a full reindex of all products and categories in batches of 50. This subscriber:

1. Paginates through all products, indexing published and removing unpublished
2. Paginates through all categories, indexing active/non-internal and removing others

The `elasticsearch.sync` event is emitted by:
- The admin sync API route (`POST /admin/elasticsearch/sync`)
- The scheduled reindex job (daily at midnight)
- Any custom code that calls `eventBus.emit({ name: "elasticsearch.sync", data: {} })`

## Subscriber Structure

A subscriber file must export:

- A **default function** that receives `{ event, container }` as its argument
- A **config object** specifying which event(s) to listen to

```ts
import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'

export default async function handler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  // Handle the event
}

export const config: SubscriberConfig = {
  event: 'event.name',  // or an array: ['event.one', 'event.two']
}
```

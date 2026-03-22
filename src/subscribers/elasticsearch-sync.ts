import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import {
  syncProductsToElasticsearchWorkflow,
  deleteProductsFromElasticsearchWorkflow,
  syncCategoriesToElasticsearchWorkflow,
  deleteCategoriesFromElasticsearchWorkflow,
} from '../workflows/index.js'

const BATCH_SIZE = 50

export default async function handleElasticsearchSync({
  container,
}: SubscriberArgs<Record<string, unknown>>) {
  const query = container.resolve('query')
  const logger = container.resolve('logger')

  // Sync products
  logger.info('Elasticsearch: starting full product sync')

  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data: products } = await query.graph({
      entity: 'product',
      fields: ['id', 'status'],
      pagination: {
        skip: offset,
        take: BATCH_SIZE,
      },
    })

    if (!products.length) {
      break
    }

    const publishedIds = products
      .filter((p: any) => p.status === 'published')
      .map((p: any) => p.id as string)

    const unpublishedIds = products
      .filter((p: any) => p.status !== 'published')
      .map((p: any) => p.id as string)

    if (publishedIds.length) {
      await syncProductsToElasticsearchWorkflow(container).run({
        input: { ids: publishedIds },
      })
    }

    if (unpublishedIds.length) {
      await deleteProductsFromElasticsearchWorkflow(container).run({
        input: { ids: unpublishedIds },
      })
    }

    offset += BATCH_SIZE
    hasMore = products.length === BATCH_SIZE
  }

  logger.info('Elasticsearch: product sync completed')

  // Sync categories
  logger.info('Elasticsearch: starting full category sync')

  offset = 0
  hasMore = true

  while (hasMore) {
    const { data: categories } = await query.graph({
      entity: 'product_category',
      fields: ['id', 'is_active', 'is_internal'],
      pagination: {
        skip: offset,
        take: BATCH_SIZE,
      },
    })

    if (!categories.length) {
      break
    }

    const activeIds = categories
      .filter((c: any) => c.is_active === true && c.is_internal !== true)
      .map((c: any) => c.id as string)

    const inactiveIds = categories
      .filter((c: any) => c.is_active !== true || c.is_internal === true)
      .map((c: any) => c.id as string)

    if (activeIds.length) {
      await syncCategoriesToElasticsearchWorkflow(container).run({
        input: { ids: activeIds },
      })
    }

    if (inactiveIds.length) {
      await deleteCategoriesFromElasticsearchWorkflow(container).run({
        input: { ids: inactiveIds },
      })
    }

    offset += BATCH_SIZE
    hasMore = categories.length === BATCH_SIZE
  }

  logger.info('Elasticsearch: full sync completed')
}

export const config: SubscriberConfig = {
  event: 'elasticsearch.sync',
}

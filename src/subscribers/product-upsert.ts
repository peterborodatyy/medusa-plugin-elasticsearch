import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { syncProductsToElasticsearchWorkflow } from '../workflows/index.js'

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

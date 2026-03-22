import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { syncCategoriesToElasticsearchWorkflow } from '../workflows'

export default async function handleCategoryUpsert({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await syncCategoriesToElasticsearchWorkflow(container).run({
    input: { ids: [data.id] },
  })
}

export const config: SubscriberConfig = {
  event: ['product-category.created', 'product-category.updated'],
}

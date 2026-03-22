import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { deleteCategoriesFromElasticsearchWorkflow } from '../workflows/index.js'

export default async function handleCategoryDeleted({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await deleteCategoriesFromElasticsearchWorkflow(container).run({
    input: { ids: [data.id] },
  })
}

export const config: SubscriberConfig = {
  event: 'product-category.deleted',
}

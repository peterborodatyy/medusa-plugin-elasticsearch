import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { deleteProductsFromElasticsearchWorkflow } from "../workflows"

export default async function handleProductDeleted({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await deleteProductsFromElasticsearchWorkflow(container).run({
    input: { ids: [data.id] },
  })
}

export const config: SubscriberConfig = {
  event: "product.deleted",
}

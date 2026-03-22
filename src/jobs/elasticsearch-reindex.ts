import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function elasticsearchReindexJob(
  container: MedusaContainer
) {
  const eventModuleService = container.resolve(Modules.EVENT_BUS)

  await eventModuleService.emit({
    name: "elasticsearch.sync",
    data: {},
  })
}

export const config = {
  name: "elasticsearch-daily-reindex",
  schedule: "0 0 * * *", // daily at midnight
}

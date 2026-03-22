import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const eventModuleService = req.scope.resolve(Modules.EVENT_BUS)

  await eventModuleService.emit({
    name: "elasticsearch.sync",
    data: {},
  })

  res.json({ message: "Syncing products to Elasticsearch" })
}

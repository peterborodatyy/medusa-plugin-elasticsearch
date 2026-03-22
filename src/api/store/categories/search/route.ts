import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ELASTICSEARCH_MODULE } from "../../../../modules/elasticsearch"
import type ElasticsearchModuleService from "../../../../modules/elasticsearch/service"

type SearchBody = {
  q: string
  offset?: number
  limit?: number
  filter?: Record<string, unknown>
}

export async function POST(
  req: MedusaRequest<SearchBody>,
  res: MedusaResponse
) {
  const elasticsearchService: ElasticsearchModuleService =
    req.scope.resolve(ELASTICSEARCH_MODULE)

  const { q, offset, limit, filter } = req.body

  const results = await elasticsearchService.search(q, "categories", {
    paginationOptions: {
      offset: offset ?? 0,
      limit: limit ?? 20,
    },
    filter,
  })

  res.json(results)
}

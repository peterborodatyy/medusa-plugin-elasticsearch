import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ELASTICSEARCH_MODULE } from "../modules/elasticsearch"

type DeleteProductsInput = {
  ids: string[]
}

const deleteProductsFromIndexStep = createStep(
  "delete-products-from-es",
  async ({ ids }: DeleteProductsInput, { container }) => {
    const elasticsearchService = container.resolve(ELASTICSEARCH_MODULE)
    await elasticsearchService.deleteFromIndex(ids, "products")

    return new StepResponse(ids)
  }
)

export const deleteProductsFromElasticsearchWorkflow = createWorkflow(
  "delete-products-from-elasticsearch",
  (input: DeleteProductsInput) => {
    const deletedIds = deleteProductsFromIndexStep(input)
    return new WorkflowResponse(deletedIds)
  }
)

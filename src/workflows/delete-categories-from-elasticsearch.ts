import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk'
import { ELASTICSEARCH_MODULE } from '../modules/elasticsearch'

type DeleteCategoriesInput = {
  ids: string[]
}

const deleteCategoriesFromIndexStep = createStep(
  'delete-categories-from-es',
  async ({ ids }: DeleteCategoriesInput, { container }) => {
    const elasticsearchService = container.resolve(ELASTICSEARCH_MODULE)
    await elasticsearchService.deleteFromIndex(ids, 'categories')

    return new StepResponse(ids)
  }
)

export const deleteCategoriesFromElasticsearchWorkflow = createWorkflow(
  'delete-categories-from-elasticsearch',
  (input: DeleteCategoriesInput) => {
    const deletedIds = deleteCategoriesFromIndexStep(input)
    return new WorkflowResponse(deletedIds)
  }
)

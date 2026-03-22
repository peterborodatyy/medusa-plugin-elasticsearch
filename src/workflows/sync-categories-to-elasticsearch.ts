import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk'
import { ELASTICSEARCH_MODULE } from '../modules/elasticsearch'

type SyncCategoriesInput = {
  ids: string[]
}

const fetchCategoriesStep = createStep(
  'fetch-categories-for-es',
  async ({ ids }: SyncCategoriesInput, { container }) => {
    const query = container.resolve('query')

    const { data: categories } = await query.graph({
      entity: 'product_category',
      fields: [
        'id',
        'name',
        'handle',
        'description',
        'is_active',
        'is_internal',
        'rank',
        'parent_category_id',
        'parent_category.name',
        'parent_category.handle',
        'category_children.id',
        'metadata',
      ],
      filters: {
        id: ids,
      },
    })

    return new StepResponse(categories)
  }
)

const indexCategoriesStep = createStep(
  'index-categories-in-es',
  async (categories: Record<string, unknown>[], { container }) => {
    const elasticsearchService = container.resolve(ELASTICSEARCH_MODULE)

    const activeCategories = categories.filter(
      (c) => c.is_active === true && c.is_internal !== true
    )
    const inactiveIds = categories
      .filter((c) => c.is_active !== true || c.is_internal === true)
      .map((c) => c.id as string)

    if (activeCategories.length) {
      await elasticsearchService.indexData(activeCategories, 'categories')
    }

    if (inactiveIds.length) {
      await elasticsearchService.deleteFromIndex(inactiveIds, 'categories')
    }

    return new StepResponse({
      indexedIds: activeCategories.map((c) => c.id as string),
      deletedIds: inactiveIds,
    })
  },
  async (
    result: { indexedIds: string[]; deletedIds: string[] } | undefined,
    { container }
  ) => {
    if (!result) return

    const elasticsearchService = container.resolve(ELASTICSEARCH_MODULE)

    if (result.indexedIds?.length) {
      await elasticsearchService.deleteFromIndex(
        result.indexedIds,
        'categories'
      )
    }
  }
)

export const syncCategoriesToElasticsearchWorkflow = createWorkflow(
  'sync-categories-to-elasticsearch',
  (input: SyncCategoriesInput) => {
    const categories = fetchCategoriesStep(input)
    const result = indexCategoriesStep(categories)
    return new WorkflowResponse(result)
  }
)

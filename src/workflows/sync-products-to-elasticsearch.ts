import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk'
import { ELASTICSEARCH_MODULE } from '../modules/elasticsearch'

type SyncProductsInput = {
  ids: string[]
}

const fetchProductsStep = createStep(
  'fetch-products-for-es',
  async ({ ids }: SyncProductsInput, { container }) => {
    const query = container.resolve('query')

    const { data: products } = await query.graph({
      entity: 'product',
      fields: [
        'id',
        'title',
        'subtitle',
        'description',
        'handle',
        'status',
        'thumbnail',
        'weight',
        'length',
        'height',
        'width',
        'hs_code',
        'origin_country',
        'mid_code',
        'material',
        'metadata',
        'tags.*',
        'type.*',
        'collection.*',
        'categories.*',
        'images.*',
        'variants.*',
        'variants.options.*',
      ],
      filters: {
        id: ids,
      },
    })

    return new StepResponse(products)
  }
)

const indexProductsStep = createStep(
  'index-products-in-es',
  async (products: Record<string, unknown>[], { container }) => {
    const elasticsearchService = container.resolve(ELASTICSEARCH_MODULE)

    const publishedProducts = products.filter((p) => p.status === 'published')
    const unpublishedIds = products
      .filter((p) => p.status !== 'published')
      .map((p) => p.id as string)

    if (publishedProducts.length) {
      await elasticsearchService.indexData(publishedProducts, 'products')
    }

    if (unpublishedIds.length) {
      await elasticsearchService.deleteFromIndex(unpublishedIds, 'products')
    }

    return new StepResponse({
      indexedIds: publishedProducts.map((p) => p.id as string),
      deletedIds: unpublishedIds,
    })
  },
  async (
    result: { indexedIds: string[]; deletedIds: string[] } | undefined,
    { container }
  ) => {
    if (!result) return

    const elasticsearchService = container.resolve(ELASTICSEARCH_MODULE)

    if (result.indexedIds?.length) {
      await elasticsearchService.deleteFromIndex(result.indexedIds, 'products')
    }
  }
)

export const syncProductsToElasticsearchWorkflow = createWorkflow(
  'sync-products-to-elasticsearch',
  (input: SyncProductsInput) => {
    const products = fetchProductsStep(input)
    const result = indexProductsStep(products)
    return new WorkflowResponse(result)
  }
)

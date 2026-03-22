import { LoaderOptions } from '@medusajs/framework/types'
import ElasticsearchModuleService from '../service.js'

export default async function initializeElasticsearchLoader({
  container,
}: LoaderOptions) {
  try {
    const service = container.resolve(
      'elasticsearch'
    ) as ElasticsearchModuleService
    await service.initializeIndexes()
  } catch (err) {
    const logger = container.resolve('logger')
    logger.warn(`Elasticsearch: failed to initialize indexes - ${err}`)
  }
}

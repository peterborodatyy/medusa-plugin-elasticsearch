import { LoaderOptions } from '@medusajs/framework/types'
import ElasticsearchModuleService from '../service'

export default async function initializeElasticsearchLoader({
  container,
}: LoaderOptions) {
  try {
    const service: ElasticsearchModuleService =
      container.resolve('elasticsearch')
    await service.initializeIndexes()
  } catch (err) {
    const logger = container.resolve('logger')
    logger.warn('Elasticsearch: failed to initialize indexes', err)
  }
}

import { Logger, MedusaContainer } from '@medusajs/modules-sdk';
import { ElasticsearchPluginOptions } from '../types';
import ElasticsearchService from '../services/elasticsearch';

export default async (
  container: MedusaContainer,
  options: ElasticsearchPluginOptions
) => {
  const logger: Logger = container.resolve('logger');

  try {
    const service: ElasticsearchService = container.resolve(
      'elasticsearchService'
    );

    const { settings } = options;

    await Promise.all(
      Object.entries(settings ?? {}).map(([indexName, value]) => {
        return service.updateSettings(indexName, value);
      })
    );
  } catch (err) {
    // ignore
    logger.warn('es: ', err);
  }
};

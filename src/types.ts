import { SearchTypes } from '@medusajs/types';
import { ClientOptions } from '@elastic/elasticsearch';
import {
  IndicesIndexSettings,
  MappingTypeMapping,
} from '@elastic/elasticsearch/lib/api/types';

export type SearchOptions = {
  paginationOptions: Record<string, unknown>;
  filter: string;
  additionalOptions: Record<string, unknown>;
};

type ElasticIndexOptions = {
  mappings?: MappingTypeMapping;
  settings?: IndicesIndexSettings;
};

export type IndexOptions = SearchTypes.IndexSettings & ElasticIndexOptions;

export type ElasticsearchPluginOptions = {
  config: ClientOptions;

  /**
   * Index settings
   */
  settings?: Record<string, IndexOptions>;
};

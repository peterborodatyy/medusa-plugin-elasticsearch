import { ClientOptions } from "@elastic/elasticsearch"
import {
  IndicesIndexSettings,
  MappingTypeMapping,
} from "@elastic/elasticsearch/lib/api/types"

export type SearchOptions = {
  paginationOptions?: {
    offset?: number
    limit?: number
  }
  filter?: Record<string, unknown>
  additionalOptions?: Record<string, unknown>
}

export type ElasticIndexSettings = {
  mappings?: MappingTypeMapping
  settings?: IndicesIndexSettings
}

export type IndexConfig = ElasticIndexSettings & {
  transformer?: (document: Record<string, unknown>) => Record<string, unknown>
  searchableAttributes?: string[]
  attributesToRetrieve?: string[]
}

export type ElasticsearchPluginOptions = {
  config: ClientOptions
  settings?: Record<string, IndexConfig>
}

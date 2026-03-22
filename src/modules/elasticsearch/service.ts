import { Client, ClientOptions } from '@elastic/elasticsearch'
import {
  ElasticsearchPluginOptions,
  IndexConfig,
  SearchOptions,
} from './types.js'
import { transformProduct, transformCategory } from '../../utils/transformer.js'

type InjectedDependencies = Record<string, unknown>

export default class ElasticsearchModuleService {
  protected readonly options_: ElasticsearchPluginOptions
  protected readonly client_: Client

  constructor(_: InjectedDependencies, options: ElasticsearchPluginOptions) {
    this.options_ = options
    this.client_ = new Client(options.config as ClientOptions)
  }

  async createIndex(indexName: string, options?: Record<string, unknown>) {
    return this.client_.indices.create({
      index: indexName,
      ...options,
    })
  }

  async getIndex(indexName: string) {
    return this.client_.indices.get({ index: indexName })
  }

  async indexData(documents: Record<string, unknown>[], type: string) {
    const indexName = this.getIndexName(type)
    const transformed = this.getTransformedDocuments(type, documents)

    if (!transformed.length) {
      return
    }

    return this.client_.bulk({
      refresh: true,
      operations: transformed.flatMap((doc) => [
        { index: { _index: indexName, _id: doc.id as string } },
        doc,
      ]),
    })
  }

  async search(query: string, type: string, options?: SearchOptions) {
    const indexName = this.getIndexName(type)
    const { paginationOptions, filter, additionalOptions } = options || {}

    return this.client_.search({
      index: indexName,
      q: query,
      ...(filter ? { body: { query: filter } } : {}),
      ...(paginationOptions?.offset !== undefined
        ? { from: paginationOptions.offset }
        : {}),
      ...(paginationOptions?.limit !== undefined
        ? { size: paginationOptions.limit }
        : {}),
      ...additionalOptions,
    })
  }

  async retrieveFromIndex(objectIDs: string[], type: string) {
    const indexName = this.getIndexName(type)

    return this.client_.mget({
      index: indexName,
      ids: objectIDs,
    })
  }

  async deleteFromIndex(objectIDs: string[], type: string) {
    const indexName = this.getIndexName(type)

    if (!objectIDs.length) {
      return
    }

    return this.client_.bulk({
      refresh: true,
      operations: objectIDs.flatMap((id) => [
        { delete: { _index: indexName, _id: id } },
      ]),
    })
  }

  async deleteAllDocuments(type: string) {
    const indexName = this.getIndexName(type)

    return this.client_.deleteByQuery({
      index: indexName,
      body: {
        query: {
          match_all: {},
        },
      },
    })
  }

  async updateSettings(indexName: string, config: IndexConfig) {
    const { mappings, settings } = config

    const exists = await this.client_.indices.exists({
      index: indexName,
    })

    if (exists) {
      await this.client_.indices.delete({
        index: indexName,
      })
    }

    return this.createIndex(indexName, {
      mappings,
      settings,
    })
  }

  async initializeIndexes() {
    const { settings } = this.options_

    if (!settings) {
      return
    }

    await Promise.all(
      Object.entries(settings).map(([indexName, config]) =>
        this.updateSettings(indexName, config)
      )
    )
  }

  getIndexName(type: string): string {
    return type
  }

  private getTransformedDocuments(
    type: string,
    documents: Record<string, unknown>[]
  ): Record<string, unknown>[] {
    if (!documents?.length) {
      return []
    }

    const customTransformer = this.options_.settings?.[type]?.transformer

    if (customTransformer) {
      return documents.map(customTransformer)
    }

    if (type === 'products') {
      return documents.map(transformProduct)
    }

    if (type === 'categories') {
      return documents.map(transformCategory)
    }

    return documents
  }
}

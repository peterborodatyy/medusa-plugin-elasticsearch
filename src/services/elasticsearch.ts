import { SearchTypes } from '@medusajs/types';
import { AbstractSearchService } from '@medusajs/utils';
import { Client, ClientOptions } from '@elastic/elasticsearch';
import { ElasticsearchPluginOptions, IndexOptions } from '../types';
import { transformProduct } from '../utils/transformer';

class ElasticsearchService extends AbstractSearchService {
  isDefault = false;

  protected readonly config_: ElasticsearchPluginOptions;
  protected readonly client_: Client;

  constructor(_, options: ElasticsearchPluginOptions) {
    super(_, options);

    this.config_ = options;
    this.client_ = new Client(<ClientOptions>options.config);
  }

  createIndex(indexName: string, options: Record<string, any>) {
    return this.client_.indices.create({
      index: indexName,
      ...options,
    });
  }

  getIndex(indexName: string) {
    return this.client_.indices.get({ index: indexName });
  }

  addDocuments(
    indexName: string,
    documents: Record<string, any>[],
    type: string
  ) {
    return this.client_.bulk({
      refresh: true,
      operations: this.getTransformedDocuments(type, documents).flatMap(
        (doc) => [{ index: { _index: indexName, _id: doc.id } }, doc]
      ),
    });
  }

  replaceDocuments(
    indexName: string,
    documents: Record<string, any>[],
    type: string
  ) {
    return this.client_.bulk({
      refresh: true,
      operations: this.getTransformedDocuments(type, documents).flatMap(
        (doc) => [{ index: { _index: indexName, _id: doc.id } }, doc]
      ),
    });
  }

  deleteDocument(indexName: string, document_id: string) {
    return this.client_.delete({
      index: indexName,
      id: document_id,
    });
  }

  deleteAllDocuments(indexName: string) {
    return this.client_.deleteByQuery({
      index: indexName,
      body: {
        query: {
          match_all: {},
        },
      },
    });
  }

  search(indexName: string, query: string, options: Record<string, any>) {
    const { paginationOptions, filter, additionalOptions } = options;

    return this.client_.search({
      index: indexName,
      q: query,
      body: {
        query: filter,
      },
      from: paginationOptions.offset,
      size: paginationOptions.limit,
      ...additionalOptions,
    });
  }

  async updateSettings(
    indexName: string,
    { mappings, settings }: IndexOptions
  ) {
    // Check if index is already created with mappings
    const exists = await this.client_.indices.exists({
      index: indexName,
    });

    // drop index, to create new one with updated mapping
    if (exists) {
      await this.client_.indices.delete({
        index: indexName,
      });
    }

    // create new index
    return this.createIndex(indexName, {
      mappings,
      settings,
    });
  }

  private getTransformedDocuments(type: string, documents: any[]) {
    if (!documents?.length) {
      return [];
    }

    switch (type) {
      case SearchTypes.indexTypes.PRODUCTS:
        const productsTransformer =
          this.config_.settings?.[SearchTypes.indexTypes.PRODUCTS]
            ?.transformer ?? transformProduct;

        return documents.map(productsTransformer);
      default:
        return documents;
    }
  }
}

export default ElasticsearchService;

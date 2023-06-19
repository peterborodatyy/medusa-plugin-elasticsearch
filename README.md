# Elasticsearch

Provide powerful indexing and searching features in your commerce application with Elasticsearch.

## Features

- Flexible configurations for specifying searchable and retrievable attributes.
- Utilize Elasticsearch's powerful search functionalities including possibility to configure custom mappings, indexes, tokenizers and more.

---

## Prerequisites

- [Medusa backend](https://docs.medusajs.com/development/backend/install)
- Elasticsearch instance or cloud

---

## How to Install

1\. Run the following command in the directory of the Medusa backend:

```bash
npm install medusa-plugin-elasticsearch
```

2\. Set the environment variables in `.env`, based on your configuration.

3\. In `medusa-config.js` add the following at the end of the `plugins` array:

```js
const plugins = [
// ...
{
  resolve: `medusa-plugin-elasticsearch`,
  options: {
    config: {
      cloud: {
        id: process.env.ELASTIC_CLOUD_ID
      },
      auth: {
        username: process.env.ELASTIC_USER_NAME,
        password: process.env.ELASTIC_PASSWORD,
      },
    },
    settings: {
      products: {
        indexSettings: {
          searchableAttributes: ["title", "description"],
          attributesToRetrieve: [
            "id",
            "title",
            "description",
            "handle",
            "thumbnail",
            "variants",
            "variant_sku",
            "options",
            "collection_title",
            "collection_handle",
            "images",
          ],
        },
        transformer: (product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          // other attributes...
        }),
        mappings: { // Not required, used in case if custom mapping configuration is needed
          properties: {
            id: {
              type: 'keyword',
            },
            name: {
              type: 'keyword',
            },
            description: {
              type: 'text',
            },
          },
        }
        settings: { // Not required, used in case if custom index settings are needed
          analysis: {
            normalizer: {
              sortable: {
                type: 'lowercase',
              },
            },
            tokenizer: {
              autocomplete: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 10,
                token_chars: ['letter', 'digit'],
              },
            },
            analyzer: {
              autocomplete_index: {
                type: 'custom',
                tokenizer: 'autocomplete',
                filter: ['lowercase'],
              },
            },
          },
        },
      },
    },
  },
},
]
```

## Options

#### 1. Global options

| Name | Description | Required |
-------|-------------|----------|
| `config` | The Elasticsearch [client configuration](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-configuration.html). | true |
| `settings` | The indexes list and configurations. | true |

#### 2. Index Options

| Name | Description | Required |
-------|-------------|----------|
| `indexSettings` |  Standard Medusa [index settings](https://docs.medusajs.com/plugins/search/algolia#index-settings).  | true |
| `transformer` | Custom object transformer function. | false |
| `mappings` | Custom Elasticsearch mapping configuration. | false |
| `settings` | Custom Elasticsearch index configuration. | false |

## Test the Plugin

1\. Run the following command in the directory of the Medusa backend to run the backend:

```bash
npm run start
```

2\. Try searching products either using your storefront or using the [Store APIs](https://docs.medusajs.com/api/store#tag/Product/operation/PostProductsSearch).

3\. Example search response:
```json
{
    "took": 1,
    "timed_out": false,
    "_shards": {
        "total": 1,
        "successful": 1,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 1,
            "relation": "eq"
        },
        "max_score": 0.06801665,
        "hits": [
            {
                "_index": "products",
                "_id": "prod_01H2P51GTXD6Y4BB4C950VBQYN",
                "_score": 0.06801665,
                "_source": {
                    "id": "prod_01H2P51GTXD6Y4BB4C950VBQYN",
                    "title": "Medusa Sweatshirt",
                    "description": "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary."
                }
            }
        ]
    }
}
```

---

## Additional Resources

- [Elasticsearch Node.js client](https://github.com/elastic/elasticsearch-js)

# Custom API Routes

An API Route is a REST API endpoint.

An API Route is created in a TypeScript or JavaScript file under the `/src/api` directory. The file's name must be `route.ts` or `route.js`.

Learn more about API routes in [this documentation](https://docs.medusajs.com/learn/fundamentals/api-routes).

## Plugin Routes

This plugin defines the following API routes:

### Store Routes (public)

#### `POST /store/products/search`

Search products indexed in Elasticsearch.

```ts
// Request body
{
  "q": "sweatshirt",    // Search query (required)
  "offset": 0,          // Pagination offset (optional)
  "limit": 20,          // Pagination limit (optional)
  "filter": {}           // Elasticsearch filter query (optional)
}
```

#### `POST /store/categories/search`

Search product categories indexed in Elasticsearch.

```ts
// Request body
{
  "q": "electronics",   // Search query (required)
  "offset": 0,          // Pagination offset (optional)
  "limit": 20,          // Pagination limit (optional)
  "filter": {}           // Elasticsearch filter query (optional)
}
```

### Admin Routes (authenticated)

#### `POST /admin/elasticsearch/sync`

Triggers a full reindex of all products and categories. Requires admin authentication (session, bearer, or API key).

```ts
// Response
{
  "message": "Syncing products to Elasticsearch"
}
```

## Middleware

Middleware is defined in `src/api/middlewares.ts`. This plugin configures:

- **Body validation** for store search routes using Zod schemas
- **Authentication** for admin routes using session, bearer, or API key

```ts
import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
} from '@medusajs/framework/http'

export default defineMiddlewares({
  routes: [
    {
      matcher: '/store/products/search',
      method: 'POST',
      middlewares: [validateAndTransformBody(PostStoreProductsSearchSchema)],
    },
    {
      matcher: '/admin/elasticsearch/*',
      middlewares: [authenticate('user', ['session', 'bearer', 'api-key'])],
    },
  ],
})
```

## Using the Container

The Medusa container is available on `req.scope`. Use it to resolve the Elasticsearch module service:

```ts
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ELASTICSEARCH_MODULE } from '../../modules/elasticsearch'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const elasticsearchService = req.scope.resolve(ELASTICSEARCH_MODULE)
  const results = await elasticsearchService.search(req.body.q, 'products')
  res.json(results)
}
```

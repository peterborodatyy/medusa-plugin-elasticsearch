import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
} from '@medusajs/framework/http'
import { PostStoreProductsSearchSchema } from './store/products/search/validators'
import { PostStoreCategoriesSearchSchema } from './store/categories/search/validators'

export default defineMiddlewares({
  routes: [
    {
      matcher: '/store/products/search',
      method: 'POST',
      middlewares: [validateAndTransformBody(PostStoreProductsSearchSchema)],
    },
    {
      matcher: '/store/categories/search',
      method: 'POST',
      middlewares: [validateAndTransformBody(PostStoreCategoriesSearchSchema)],
    },
    {
      matcher: '/admin/elasticsearch/*',
      middlewares: [authenticate('user', ['session', 'bearer', 'api-key'])],
    },
  ],
})

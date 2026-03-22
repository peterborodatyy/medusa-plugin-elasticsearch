import { z } from 'zod'

export const PostStoreProductsSearchSchema = z.object({
  q: z.string(),
  offset: z.number().optional(),
  limit: z.number().optional(),
  filter: z.record(z.unknown()).optional(),
})

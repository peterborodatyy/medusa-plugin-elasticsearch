import { z } from 'zod'

export const PostStoreCategoriesSearchSchema = z.object({
  q: z.string(),
  offset: z.number().optional(),
  limit: z.number().optional(),
  filter: z.record(z.string(), z.unknown()).optional(),
})

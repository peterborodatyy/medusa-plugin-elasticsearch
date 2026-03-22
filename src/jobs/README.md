# Scheduled Jobs

A scheduled job is a function executed at a specified interval of time in the background of your Medusa application.

A scheduled job is created in a TypeScript or JavaScript file under the `src/jobs` directory.

Learn more about scheduled jobs in [this documentation](https://docs.medusajs.com/learn/fundamentals/scheduled-jobs).

## Plugin Jobs

### Elasticsearch Reindex (`elasticsearch-reindex.ts`)

Triggers a full reindex of all products and categories by emitting the `elasticsearch.sync` event. Runs daily at midnight.

```ts
import { MedusaContainer } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export default async function elasticsearchReindexJob(
  container: MedusaContainer
) {
  const eventModuleService = container.resolve(Modules.EVENT_BUS)

  await eventModuleService.emit({
    name: 'elasticsearch.sync',
    data: {},
  })
}

export const config = {
  name: 'elasticsearch-daily-reindex',
  schedule: '0 0 * * *', // Every day at midnight
}
```

## Job Structure

A scheduled job file must export:

- A **default async function** that receives a `MedusaContainer` instance used to resolve services
- A **config object** with the following properties:
  - `name`: a unique name for the job
  - `schedule`: a [cron expression](https://crontab.guru/) defining when to run
  - `numberOfExecutions`: (optional) how many times the job will execute before being removed

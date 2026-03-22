import { Module } from '@medusajs/framework/utils'
import ElasticsearchModuleService from './service.js'

export const ELASTICSEARCH_MODULE = 'elasticsearch'

export default Module(ELASTICSEARCH_MODULE, {
  service: ElasticsearchModuleService,
})

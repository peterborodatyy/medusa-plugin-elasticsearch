import { useState } from 'react'
import {
  Button,
  Container,
  Heading,
  Text,
  Input,
  toast,
} from '@medusajs/ui'
import { useMutation } from '@tanstack/react-query'
import { defineRouteConfig } from '@medusajs/admin-sdk'
import { sdk } from '../../../lib/sdk'

type SearchHit = {
  _id: string
  _score: number
  _source: Record<string, unknown>
}

type SearchResponse = {
  hits: {
    total: { value: number } | number
    hits: SearchHit[]
  }
}

const ElasticsearchSettingsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const { mutate: syncData, isPending: syncPending } = useMutation({
    mutationFn: () =>
      sdk.client.fetch('/admin/elasticsearch/sync', {
        method: 'POST',
      }),
    onSuccess: () => {
      toast.success('Successfully triggered sync to Elasticsearch')
    },
    onError: (err) => {
      console.error(err)
      toast.error('Failed to trigger sync')
    },
  })

  const {
    mutate: searchProducts,
    isPending: searchProductsPending,
    data: productResults,
  } = useMutation({
    mutationFn: async () => {
      if (!searchQuery.trim()) {
        throw new Error('Search query cannot be empty')
      }
      return sdk.client.fetch<SearchResponse>(
        '/store/products/search',
        {
          method: 'POST',
          body: {
            q: searchQuery.trim(),
            limit: 5,
            offset: 0,
          },
        }
      )
    },
    onSuccess: (data) => {
      const total =
        typeof data.hits.total === 'number'
          ? data.hits.total
          : data.hits.total.value
      toast.success(`Found ${total} products`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Search failed')
    },
  })

  const {
    mutate: searchCategories,
    isPending: searchCategoriesPending,
    data: categoryResults,
  } = useMutation({
    mutationFn: async () => {
      if (!searchQuery.trim()) {
        throw new Error('Search query cannot be empty')
      }
      return sdk.client.fetch<SearchResponse>(
        '/store/categories/search',
        {
          method: 'POST',
          body: {
            q: searchQuery.trim(),
            limit: 5,
            offset: 0,
          },
        }
      )
    },
    onSuccess: (data) => {
      const total =
        typeof data.hits.total === 'number'
          ? data.hits.total
          : data.hits.total.value
      toast.success(`Found ${total} categories`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Search failed')
    },
  })

  const renderHits = (hits?: SearchHit[]) => {
    if (!hits?.length) return null
    return (
      <div className="mt-3 space-y-2">
        {hits.map((hit) => (
          <div
            key={hit._id}
            className="border border-gray-200 rounded-md p-3 text-sm"
          >
            <div className="flex justify-between">
              <Text className="font-medium">
                {(hit._source.title as string) ||
                  (hit._source.name as string) ||
                  hit._id}
              </Text>
              <Text className="text-gray-400">
                score: {hit._score?.toFixed(3)}
              </Text>
            </div>
            {hit._source.description && (
              <Text className="text-gray-500 mt-1 text-xs truncate">
                {hit._source.description as string}
              </Text>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <Container>
      <div className="flex flex-col gap-y-6">
        <div>
          <Heading level="h1">Elasticsearch</Heading>
          <Text className="text-gray-500 mt-2">
            Manage index synchronization and test search queries.
          </Text>
        </div>

        {/* Data Synchronization */}
        <div className="border border-gray-200 rounded-lg p-6">
          <Heading level="h2" className="mb-2">
            Data Synchronization
          </Heading>
          <Text className="text-gray-500 mb-4">
            Trigger a full reindex of all products and categories to
            Elasticsearch. The sync runs in the background.
          </Text>
          <Button
            onClick={() => syncData()}
            isLoading={syncPending}
            variant="primary"
          >
            Sync Now
          </Button>
        </div>

        {/* Search Testing */}
        <div className="border border-gray-200 rounded-lg p-6">
          <Heading level="h2" className="mb-2">
            Search Testing
          </Heading>
          <Text className="text-gray-500 mb-4">
            Test your search configuration against the Elasticsearch index.
          </Text>

          <div className="space-y-4">
            <div>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Search Query
              </Text>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query..."
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => searchProducts()}
                isLoading={searchProductsPending}
                variant="secondary"
                disabled={!searchQuery.trim()}
              >
                Search Products
              </Button>

              <Button
                onClick={() => searchCategories()}
                isLoading={searchCategoriesPending}
                variant="secondary"
                disabled={!searchQuery.trim()}
              >
                Search Categories
              </Button>
            </div>

            {productResults && (
              <div>
                <Text className="font-medium">Product Results</Text>
                {renderHits(productResults.hits.hits)}
              </div>
            )}

            {categoryResults && (
              <div>
                <Text className="font-medium">Category Results</Text>
                {renderHits(categoryResults.hits.hits)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: 'Elasticsearch',
})

export default ElasticsearchSettingsPage

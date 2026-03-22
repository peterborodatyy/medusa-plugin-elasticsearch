import { Client } from "@elastic/elasticsearch"
import ElasticsearchModuleService from "../modules/elasticsearch/service"

const TEST_INDEX = "test_products"
const TEST_CATEGORIES_INDEX = "test_categories"

describe("ElasticsearchModuleService", () => {
  let service: ElasticsearchModuleService
  let client: Client

  beforeAll(async () => {
    const options = {
      config: {
        node: process.env.ELASTIC_NODE || "http://localhost:9200",
      },
      settings: {
        [TEST_INDEX]: {
          mappings: {
            properties: {
              id: { type: "keyword" as const },
              title: { type: "text" as const },
              description: { type: "text" as const },
            },
          },
        },
        [TEST_CATEGORIES_INDEX]: {
          mappings: {
            properties: {
              id: { type: "keyword" as const },
              name: { type: "text" as const },
            },
          },
        },
      },
    }

    service = new ElasticsearchModuleService({}, options)
    client = new Client({
      node: process.env.ELASTIC_NODE || "http://localhost:9200",
    })

    // Clean up any leftover test indexes
    for (const idx of [TEST_INDEX, TEST_CATEGORIES_INDEX]) {
      const exists = await client.indices.exists({ index: idx })
      if (exists) {
        await client.indices.delete({ index: idx })
      }
    }
  })

  afterAll(async () => {
    for (const idx of [TEST_INDEX, TEST_CATEGORIES_INDEX]) {
      const exists = await client.indices.exists({ index: idx })
      if (exists) {
        await client.indices.delete({ index: idx })
      }
    }
  })

  describe("Index management", () => {
    it("should create an index", async () => {
      await service.createIndex(TEST_INDEX, {
        mappings: {
          properties: {
            id: { type: "keyword" },
            title: { type: "text" },
          },
        },
      })

      const result = await service.getIndex(TEST_INDEX)
      expect(result[TEST_INDEX]).toBeDefined()
    })

    it("should update index settings (recreate)", async () => {
      await service.updateSettings(TEST_INDEX, {
        mappings: {
          properties: {
            id: { type: "keyword" },
            title: { type: "text" },
            description: { type: "text" },
          },
        },
      })

      const result = await service.getIndex(TEST_INDEX)
      expect(
        result[TEST_INDEX].mappings?.properties?.description
      ).toBeDefined()
    })
  })

  describe("Document operations", () => {
    it("should index documents", async () => {
      const docs = [
        { id: "prod_1", title: "Medusa Sweatshirt", status: "published" },
        { id: "prod_2", title: "Medusa T-Shirt", status: "published" },
        { id: "prod_3", title: "Medusa Hoodie", status: "published" },
      ]

      // Index as generic documents (not "products" type to skip transformer)
      await service.indexData(docs, TEST_INDEX)

      // Wait for refresh
      await client.indices.refresh({ index: TEST_INDEX })

      const count = await client.count({ index: TEST_INDEX })
      expect(count.count).toBe(3)
    })

    it("should search documents", async () => {
      const results = await service.search("sweatshirt", TEST_INDEX)

      expect(results.hits.total).toBeDefined()
      const total =
        typeof results.hits.total === "number"
          ? results.hits.total
          : results.hits.total?.value
      expect(total).toBeGreaterThanOrEqual(1)
    })

    it("should search with pagination", async () => {
      const results = await service.search("medusa", TEST_INDEX, {
        paginationOptions: { offset: 0, limit: 2 },
      })

      expect(results.hits.hits.length).toBeLessThanOrEqual(2)
    })

    it("should retrieve documents by ID", async () => {
      const results = await service.retrieveFromIndex(
        ["prod_1", "prod_2"],
        TEST_INDEX
      )

      expect(results.docs.length).toBe(2)
    })

    it("should delete specific documents", async () => {
      await service.deleteFromIndex(["prod_3"], TEST_INDEX)
      await client.indices.refresh({ index: TEST_INDEX })

      const count = await client.count({ index: TEST_INDEX })
      expect(count.count).toBe(2)
    })

    it("should delete all documents", async () => {
      await service.deleteAllDocuments(TEST_INDEX)
      await client.indices.refresh({ index: TEST_INDEX })

      const count = await client.count({ index: TEST_INDEX })
      expect(count.count).toBe(0)
    })
  })

  describe("Category indexing", () => {
    beforeAll(async () => {
      await service.createIndex(TEST_CATEGORIES_INDEX, {
        mappings: {
          properties: {
            id: { type: "keyword" },
            name: { type: "text" },
          },
        },
      })
    })

    it("should index categories", async () => {
      const categories = [
        { id: "pcat_1", name: "Clothing", handle: "clothing", is_active: true },
        { id: "pcat_2", name: "Electronics", handle: "electronics", is_active: true },
      ]

      await service.indexData(categories, TEST_CATEGORIES_INDEX)
      await client.indices.refresh({ index: TEST_CATEGORIES_INDEX })

      const count = await client.count({ index: TEST_CATEGORIES_INDEX })
      expect(count.count).toBe(2)
    })

    it("should search categories", async () => {
      const results = await service.search("clothing", TEST_CATEGORIES_INDEX)

      const total =
        typeof results.hits.total === "number"
          ? results.hits.total
          : results.hits.total?.value
      expect(total).toBeGreaterThanOrEqual(1)
    })
  })

  describe("Custom transformer", () => {
    it("should use custom transformer when configured", async () => {
      const customOptions = {
        config: {
          node: process.env.ELASTIC_NODE || "http://localhost:9200",
        },
        settings: {
          [TEST_INDEX]: {
            transformer: (doc: Record<string, unknown>) => ({
              id: doc.id,
              custom_field: `custom_${doc.title}`,
            }),
          },
        },
      }

      const customService = new ElasticsearchModuleService({}, customOptions)

      // Clean and recreate index
      await client.indices.delete({ index: TEST_INDEX })
      await client.indices.create({ index: TEST_INDEX })

      await customService.indexData(
        [{ id: "prod_custom", title: "Test" }],
        TEST_INDEX
      )
      await client.indices.refresh({ index: TEST_INDEX })

      const result = await client.get({
        index: TEST_INDEX,
        id: "prod_custom",
      })

      expect((result._source as Record<string, unknown>).custom_field).toBe(
        "custom_Test"
      )
    })
  })
})

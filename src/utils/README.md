# Utilities

Shared utility functions used across the plugin.

## Transformers (`transformer.ts`)

Document transformer functions that prepare data for Elasticsearch indexing.

### `transformProduct(product)`

The default product transformer. Flattens product data into a search-friendly structure:

- Flattens variant fields with a `variant_` prefix (e.g., `variant_sku`, `variant_title`, `variant_barcode`)
- Extracts variant option values into `variant_options_value`
- Maps `type.value` to `type_value`
- Maps `collection.title` and `collection.handle` to top-level fields
- Extracts tag values into `tags_value`
- Extracts category names into `categories`
- Sets `objectID` from `product.id`

### `transformCategory(category)`

The default category transformer. Extracts a flat structure with:

- Core fields: `id`, `name`, `handle`, `description`
- Status fields: `is_active`, `is_internal`, `rank`
- Parent info: `parent_category_id`, `parent_category_name`, `parent_category_handle`
- `children_count` from the `category_children` relation
- `metadata`

## Custom Transformers

You can override these defaults by providing a `transformer` function in the module options:

```ts
{
  settings: {
    products: {
      transformer: (product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
      }),
    },
    categories: {
      transformer: (category) => ({
        id: category.id,
        name: category.name,
      }),
    },
  },
}
```

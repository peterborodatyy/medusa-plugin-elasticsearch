export const transformProduct = (product: Record<string, any>) => {
  const transformedProduct: Record<string, unknown> = { ...product }

  const variantKeys = [
    'sku',
    'barcode',
    'ean',
    'upc',
    'title',
    'inventory_quantity',
    'allow_backorder',
    'manage_inventory',
    'hs_code',
    'origin_country',
    'mid_code',
    'material',
    'weight',
    'length',
    'height',
    'width',
  ]
  const prefix = 'variant'

  const initialObj: Record<string, unknown[]> = variantKeys.reduce(
    (obj, key) => {
      obj[`${prefix}_${key}`] = []
      return obj
    },
    {} as Record<string, unknown[]>
  )
  initialObj[`${prefix}_options_value`] = []

  const variants = product.variants || []

  const flattenedVariantFields = variants.reduce(
    (obj: Record<string, unknown[]>, variant: Record<string, any>) => {
      variantKeys.forEach((k) => {
        if (variant[k]) {
          obj[`${prefix}_${k}`].push(variant[k])
        }
      })

      if (variant.options) {
        const values = variant.options.map(
          (option: Record<string, any>) => option.value
        )
        obj[`${prefix}_options_value`] =
          obj[`${prefix}_options_value`].concat(values)
      }

      return obj
    },
    initialObj
  )

  transformedProduct.objectID = product.id
  transformedProduct.type_value = product.type?.value
  transformedProduct.collection_title = product.collection?.title
  transformedProduct.collection_handle = product.collection?.handle
  transformedProduct.tags_value = product.tags
    ? product.tags.map((t: Record<string, any>) => t.value)
    : []
  transformedProduct.categories = (product.categories || []).map(
    (c: Record<string, any>) => c.name
  )

  return {
    ...transformedProduct,
    ...flattenedVariantFields,
  }
}

export const transformCategory = (category: Record<string, any>) => {
  return {
    id: category.id,
    objectID: category.id,
    name: category.name,
    handle: category.handle,
    description: category.description,
    is_active: category.is_active,
    is_internal: category.is_internal,
    rank: category.rank,
    parent_category_id: category.parent_category_id,
    parent_category_name: category.parent_category?.name ?? null,
    parent_category_handle: category.parent_category?.handle ?? null,
    children_count: category.category_children?.length ?? 0,
    metadata: category.metadata,
  }
}

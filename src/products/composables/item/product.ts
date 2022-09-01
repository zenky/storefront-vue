import {
  getApiErrorMessage,
  getProduct,
  Product,
  ProductRequest,
} from '@zenky/api';
import { getApiErrorHandler, OptionalApiErrorHandler } from '../../../errors.js';
import { ItemLoader, useItemLoader } from '../../../loaders.js';
import { useNotification } from '@zenky/ui';
import { useVariant } from './variants.js';
import { useModifiers } from './modifiers.js';
import { useVariantPrice } from './prices.js';
import { Ref, ref } from 'vue';
import { ProductCardProduct } from './types.js';

export function useProductItem(errorHandler?: OptionalApiErrorHandler): ItemLoader<Product, string, ProductRequest> {
  return useItemLoader<Product, string, ProductRequest>(getProduct, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Товар не найден.'));
  }));
}

export function useProductCard(item: Product) {
  const product: Ref<ProductCardProduct> = ref({
    id: item.id,
    short_id: item.short_id,
    category_id: Array.isArray(item.categories) && item.categories.length > 0 ? item.categories[0].id : null,
    slug: item.slug,
    name: item.name,
    description: item.description,
    images: item.media || [],
    modifiers: item.modifiers || [],
    modifiers_groups: item.modifiers_groups || [],
    variants_count: item.variants?.length || 0,
    has_images: (item.media || []).length > 0,
    has_modifiers: (item.modifiers || []).length > 0 || (item.modifiers_groups || []).length > 0,
  });

  const {
    variant,
    options,
    selectedOptions,
  } = useVariant(item.variants || []);

  const {
    totalPrice,
    pricesRange,
    recalculate,
  } = useVariantPrice(item.variants || [], variant);

  const {
    modifiers,
    selectedModifiers,
    modifiersHash,
  } = useModifiers(item, variant, recalculate);

  return {
    product,
    variant,
    options,
    selectedOptions,
    pricesRange,
    totalPrice,
    modifiers,
    modifiersHash,
    selectedModifiers,
  };
}

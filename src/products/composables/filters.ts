import { useCategoryFeaturesGroupsList, useCategoryFeaturesList } from '../../catalog/features/index.js';
import { ref, Ref } from 'vue';
import { ProductsFilters, ProductsPriceFilters } from '../types.js';
import { Feature, FeaturesGroupContainer } from '@zenky/api';
import { useProductsPricesRange } from './prices.js';

export function useFeaturesFilters(categoryId: string | null, values: ProductsFilters | null) {
  const loader = useCategoryFeaturesList(categoryId);
  const filters: Ref<ProductsFilters> = ref({});
  const load = async () => {
    await loader.load();

    loader.items.value.forEach((feature: Feature) => {
      filters.value[feature.alias] = values && values[feature.alias] ? values[feature.alias] : [];
    });
  };

  return {
    filters,
    load,
    items: loader.items,
  };
}

export function useFeaturesGroupsFilters(categoryId: string | null, values: ProductsFilters | null) {
  const loader = useCategoryFeaturesGroupsList(categoryId);
  const filters: Ref<ProductsFilters> = ref({});
  const load = async () => {
    await loader.load();

    loader.items.value.forEach((container: FeaturesGroupContainer) => {
      container.features.forEach((item) => {
        filters.value[item.feature.alias] = values && values[item.feature.alias] ? values[item.feature.alias] : [];
      });
    });
  };

  return {
    filters,
    load,
    items: loader.items,
  };
}

export function useProductsPricesRangeFilters(categoryId: string | null, values?: ProductsPriceFilters | null) {
  const loader = useProductsPricesRange(categoryId);
  const filters: Ref<ProductsPriceFilters> = ref({
    min: values?.min || '',
    max: values?.max || '',
  });

  return {
    filters,
    load: async () => loader.load(),
    range: loader.data,
  };
}

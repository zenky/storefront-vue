import { getApiErrorHandler, OptionalApiErrorHandler } from '../../../errors.js';
import { usePaginatedLoader } from '../../../loaders.js';
import { getProducts, Product, ProductsPaginationRequest } from '@zenky/api';
import {
  ProductsFilters,
  ProductsFiltersType,
  ProductsListConfig,
  ProductsListProvider,
  ProductsLoader, ProductsPromotion,
  ProductsRequestCallback,
  ProductsSorting,
  ProductsSource,
  ProductsSourceType,
} from './types.js';
import { useStoreStore } from '../../../store/index.js';
import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { getProductsPaginationRequest } from './request-builder.js';
import { debounce } from 'lodash-es';
import { useFeaturesFilters, useFeaturesGroupsFilters, useProductsPricesRangeFilters } from './filters.js';

function getCategoryIdFromSource(source?: ProductsSource | null) {
  if (!source || !source.type || !source.id || source.error) {
    return null;
  } else if (source.type !== ProductsSourceType.Category) {
    return null;
  }

  return source.id;
}

export function useProductsList(config: ComputedRef<ProductsListConfig>, errorHandler?: OptionalApiErrorHandler): ProductsListProvider {
  const productsLoader = usePaginatedLoader<Product, ProductsPaginationRequest>(
    getProducts,
    getApiErrorHandler(errorHandler, 'useProductsList', 'Unable to load products list.'),
  );

  const store = useStoreStore();
  const cityId = computed(() => store.cityId);
  const sorting: Ref<ProductsSorting> = ref(config.value.sorting || ProductsSorting.Manual);
  const search: Ref<string> = ref(config.value.search || '');
  const {
    filters,
    load: loadFilters,
    items: features,
  } = config.value.filtersType === ProductsFiltersType.Features
    ? useFeaturesFilters(getCategoryIdFromSource(config.value.source), config.value.filters)
    : useFeaturesGroupsFilters(getCategoryIdFromSource(config.value.source), config.value.filters);

  const {
    filters: pricesFilters,
    load: loadPricesRange,
    range,
  } = useProductsPricesRangeFilters(getCategoryIdFromSource(config.value.source), config.value.pricesFilters);

  const allowed = ref(false);
  const loader: ComputedRef<ProductsLoader> = computed(() => ({
    source: config.value.source,
    cityId: cityId.value,
    sorting: sorting.value,
    search: search.value,
    filters: filters.value,
    pricesFilters: pricesFilters.value,
    pagination: {
      count: config.value.count,
    },
    with: config.value.with || '',
    promotion: config.value.promotion || null,
  }));

  const load = async (page: number, reset: boolean = false, callback?: ProductsRequestCallback) => {
    const request = getProductsPaginationRequest(page, loader.value);

    if (request === null) {
      allowed.value = false;

      if (typeof callback === 'function') {
        callback(null);
      }

      return;
    }

    allowed.value = true;

    await productsLoader.load(request, reset);

    if (typeof callback === 'function') {
      callback(request);
    }
  };

  const init = async (callback?: ProductsRequestCallback) => {
    if (config.value.filtersType !== null) {
      await loadFilters();
    }

    await loadPricesRange();

    watch(loader, debounce(async () => load(1, true, callback), 1000), {
      deep: true,
    });

    await load(1, true, callback);
  };

  return {
    state: productsLoader.state,
    pagination: productsLoader.pagination,
    items: productsLoader.items,
    allowed,
    filters,
    pricesFilters,
    sorting,
    features,
    search,
    pricesRange: range,
    init,
    load,
  };
}

function getFiltersForUrl(filters: any): string {
  const params: string[] = [];

  Object.keys(filters).forEach((key) => {
    params.push(`${key}:${filters[key]}`);
  });

  return params.join(';');
}

function getFiltersFromUrl(param: string): ProductsFilters | null {
  const items = param.split(';');
  const filters: ProductsFilters = {};

  items.forEach((item) => {
    const [filter, value] = item.split(':');

    if (!filter || !value) {
      return;
    }

    filters[filter] = value.split(',');
  });

  return filters;
}

function getProductsListQueryParamsWithPromotion(params: object, promotion: ProductsPromotion | null | undefined): object {
  if (!promotion) {
    return params;
  }

  const clone: any = {
    ...params,
    promotion_id: promotion.id,
    reward_id: promotion.reward_id,
  };

  if (promotion.context_type) {
    clone.context_type = promotion.context_type;
  }

  if (promotion.context_id) {
    clone.context_id = promotion.context_id;
  }

  return clone;
}

export function getProductsListQueryParams(config: ProductsListConfig, request: ProductsPaginationRequest | null): object {
  if (request === null) {
    return getProductsListQueryParamsWithPromotion({}, config.promotion);
  }

  const query: any = {};

  if (request.order_by && request.order_by !== config.sorting) {
    query.order_by = request.order_by;
  }

  if (typeof request.f !== 'undefined' && Object.keys(request.f).length > 0) {
    query.f = getFiltersForUrl(request.f);
  }

  if (request.min_price) {
    query.min_price = request.min_price;
  }

  if (request.max_price) {
    query.max_price = request.max_price;
  }

  if (request.search) {
    query.search = request.search;
  }

  return getProductsListQueryParamsWithPromotion(query, config.promotion);
}

function getQueryParam(query: any, param: string): any {
  return typeof query[param] !== 'undefined' && query[param] ? query[param] : null;
}

function getPromotionFromQuery(query: any): ProductsPromotion | null {
  const promotionId = getQueryParam(query, 'promotion_id');
  const rewardId = getQueryParam(query, 'reward_id');

  if (!promotionId || !rewardId) {
    return null;
  }

  const contextType = getQueryParam(query, 'context_type');
  const contextId = getQueryParam(query, 'context_id');

  return {
    id: promotionId,
    reward_id: rewardId,
    context_type: contextType,
    context_id: contextId,
  };
}

export function getProductsListParamsFromQuery(query: any | null | undefined): object | null {
  if (!query) {
    return null;
  }

  return {
    sorting: typeof query.order_by !== 'undefined' ? query.order_by : null,
    f: typeof query.f === 'string' ? getFiltersFromUrl(query.f) : null,
    min_price: getQueryParam(query, 'min_price'),
    max_price: getQueryParam(query, 'max_price'),
    search: getQueryParam(query, 'search'),
    promotion: getPromotionFromQuery(query),
  };
}

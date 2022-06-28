import { ProductsFilters, ProductsLoader, ProductsPriceFilters, ProductsSorting, ProductsSource } from '../types.js';
import { ProductsPaginationRequest } from '@zenky/api';

function getSourceParams(source: ProductsSource | null): object {
  if (source === null || !source.id || !source.type) {
    return {};
  }

  switch (source.type) {
    case 'category':
      return { category_id: source.id };
    case 'collection':
      return { collection_id: source.id };
    default:
      return {};
  }
}

function getSortingParams(sorting: ProductsSorting | null): object {
  if (!sorting) {
    return {};
  }

  switch (sorting) {
    case ProductsSorting.Manual:
    case ProductsSorting.NameAsc:
    case ProductsSorting.NameDesc:
    case ProductsSorting.PriceAsc:
    case ProductsSorting.PriceDesc:
      return { order_by: sorting };
    default:
      return {};
  }
}

function getFiltersParams(filters: ProductsFilters): object {
  if (typeof filters !== 'object' || !Object.keys(filters).length) {
    return {};
  }

  const features: {
    [key: string]: string;
  } = {};

  Object.keys(filters).forEach((key) => {
    if (Array.isArray(filters[key]) && filters[key].length > 0) {
      features[key] = filters[key].join(',');
    }
  });

  if (!Object.keys(features).length) {
    return {};
  }

  return { f: features };
}

function getPricesFiltersParams(filters: ProductsPriceFilters): object {
  const params: any = {};

  if (filters.min) {
    params.min_price = filters.min;
  }

  if (filters.max) {
    params.max_price = filters.max;
  }

  return params;
}

function getLoaderParams(page: number, loader: ProductsLoader): object {
  const params: any = {
    page,
    count: loader.pagination.count,
  };

  if (loader.cityId) {
    params.city_id = loader.cityId;
  }

  if (loader.visibility) {
    params.visibility = loader.visibility;
  }

  if (loader.with) {
    params.with = loader.with;
  }

  if (loader.search) {
    params.search = loader.search;
  }

  return params;
}

export function getProductsPaginationRequest(page: number, loader: ProductsLoader): ProductsPaginationRequest | null {
  if (loader.source && typeof loader.source.error !== 'undefined' && loader.source.error) {
    return null;
  }

  return {
    ...getSourceParams(loader.source),
    ...getSortingParams(loader.sorting),
    ...getFiltersParams(loader.filters),
    ...getPricesFiltersParams(loader.pricesFilters),
    ...getLoaderParams(page, loader),
  } as ProductsPaginationRequest;
}

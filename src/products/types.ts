import { PaginatedLoaderState } from '../loaders.js';
import {
  Feature,
  FeaturesGroupContainer,
  Pagination,
  Product,
  ProductsPaginationRequest,
  ProductsPricesRange,
} from '@zenky/api';
import { Ref } from 'vue';

export enum ProductsSourceType {
  Category = 'category',
  Collection = 'collection',
}

export enum ProductsSorting {
  Manual = 'manual',
  NameAsc = 'name',
  NameDesc = '-name',
  PriceAsc = 'price',
  PriceDesc = '-price',
}

export interface ProductsSource {
  type?: ProductsSourceType;
  id?: string;
  error?: boolean;
}

export interface InjectedProductsSource {
  id: string;
}

export interface ProductsFilters {
  [key: string]: string[];
}

export interface ProductsPriceFilters {
  min?: string | number | null;
  max?: string | number | null;
}

export interface ProductsLoader {
  cityId: string | null;
  source: ProductsSource | null;
  sorting: ProductsSorting;
  search: string | null;
  filters: ProductsFilters;
  pricesFilters: ProductsPriceFilters;
  visibility?: string | null;
  pagination: {
    count: number;
  };
  with?: string;
}

export type ProductsRequestCallback = (request: ProductsPaginationRequest | null) => void;

export interface ProductsListProvider {
  state: Ref<PaginatedLoaderState>;
  allowed: Ref<boolean>;
  pagination: Ref<Pagination | null>;
  items: Ref<Product[]>;
  init: (callback?: ProductsRequestCallback) => Promise<void>;
  load: (page: number, reset: boolean, callback?: ProductsRequestCallback) => Promise<void>;
  filters: Ref<ProductsFilters>;
  pricesFilters: Ref<ProductsPriceFilters>;
  pricesRange: Ref<ProductsPricesRange | null>;
  features: Ref<Feature[] | FeaturesGroupContainer[]>;
  sorting: Ref<ProductsSorting>;
  search: Ref<string | null>;
}

export enum ProductsFiltersType {
  Features = 'features',
  FeaturesGroups = 'featuresGroups',
}

export interface ProductsListConfig {
  source: ProductsSource | null;
  search?: string | null;
  sorting: ProductsSorting | null;
  filters: ProductsFilters | null;
  pricesFilters: ProductsPriceFilters | null;
  count: number;
  filtersType: ProductsFiltersType | null;
  with?: string;
}
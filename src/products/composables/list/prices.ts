import { getApiErrorHandler, OptionalApiErrorHandler } from '../../../errors.js';
import { DataLoader, useDataLoader } from '../../../loaders.js';
import { getProductsPricesRange, ProductsPricesRange } from '@zenky/api';

export function useProductsPricesRange(categoryId: string | null, errorHandler?: OptionalApiErrorHandler): DataLoader<ProductsPricesRange> {
  return useDataLoader<ProductsPricesRange>(
    async (): Promise<ProductsPricesRange> => getProductsPricesRange(categoryId),
    getApiErrorHandler(errorHandler, 'useProductsPricesRange', 'Unable to load product prices range.'),
  );
}

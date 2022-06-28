import { getApiErrorHandler, OptionalApiErrorHandler } from '../../errors.js';
import { DataLoader, useDataLoader } from '../../loaders.js';
import { getApiErrorMessage, getProductsPricesRange, ProductsPricesRange } from '@zenky/api';
import { useNotification } from '@zenky/ui';

export function useProductsPricesRange(categoryId: string | null, errorHandler?: OptionalApiErrorHandler): DataLoader<ProductsPricesRange> {
  return useDataLoader<ProductsPricesRange>(
    async (): Promise<ProductsPricesRange> => getProductsPricesRange(categoryId),
    getApiErrorHandler(errorHandler, function (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить диапазон цен.'));
    }),
  );
}

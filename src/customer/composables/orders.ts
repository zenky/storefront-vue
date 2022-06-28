import { getApiErrorHandler, OptionalApiErrorHandler } from '../../errors.js';
import { ItemLoader, PaginatedLoader, useItemLoader, usePaginatedLoader } from '../../loaders.js';
import { getApiErrorMessage, getCustomerOrders, getOrder, Order, OrderCredentials } from '@zenky/api';
import { useNotification } from '@zenky/ui';

export function useOrdersList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<Order> {
  return usePaginatedLoader<Order>(getCustomerOrders, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить список заказов.'));
  }));
}

export function useOrderItem(errorHandler?: OptionalApiErrorHandler): ItemLoader<Order, OrderCredentials> {
  return useItemLoader<Order, OrderCredentials>(getOrder, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Заказ не найден.'));
  }));
}

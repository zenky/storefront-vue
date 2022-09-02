import { getApiErrorHandler, OptionalApiErrorHandler } from '../../errors.js';
import { ItemLoader, PaginatedLoader, useItemLoader, usePaginatedLoader } from '../../loaders.js';
import { getCustomerOrders, getOrder, Order, OrderCredentials } from '@zenky/api';

export function useOrdersList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<Order> {
  return usePaginatedLoader<Order>(getCustomerOrders, getApiErrorHandler(errorHandler, 'useOrdersList', 'Unable to load orders list.'));
}

export function useOrderItem(errorHandler?: OptionalApiErrorHandler): ItemLoader<Order, OrderCredentials> {
  return useItemLoader<Order, OrderCredentials>(getOrder, getApiErrorHandler(errorHandler, 'useOrderItem', 'Unable to load order.'));
}

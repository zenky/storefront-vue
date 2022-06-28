import {
  PaginatedLoader,
  usePaginatedLoader,
} from '../../loaders.js';
import {
  CustomerPaymentMethod,
  deleteCustomerPaymentMethod,
  getApiErrorMessage,
  getCustomerPaymentMethods,
} from '@zenky/api';
import { useNotification } from '@zenky/ui';
import { getApiErrorHandler, OptionalApiErrorHandler } from '../../errors.js';
import { DataDestroyer, useDataDestroyer } from '../../destroyers.js';

export function usePaymentMethodsList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<CustomerPaymentMethod> {
  return usePaginatedLoader<CustomerPaymentMethod>(getCustomerPaymentMethods, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить способы оплаты.'));
  }));
}

export function usePaymentMethodDestroyer(errorHandler?: OptionalApiErrorHandler): DataDestroyer {
  return useDataDestroyer(deleteCustomerPaymentMethod, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось удалить способ оплаты.'));
  }));
}

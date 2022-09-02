import {
  PaginatedLoader,
  usePaginatedLoader,
} from '../../loaders.js';
import {
  CustomerPaymentMethod,
  deleteCustomerPaymentMethod,
  getCustomerPaymentMethods,
} from '@zenky/api';
import { getApiErrorHandler, OptionalApiErrorHandler } from '../../errors.js';
import { DataDestroyer, useDataDestroyer } from '../../destroyers.js';

export function usePaymentMethodsList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<CustomerPaymentMethod> {
  return usePaginatedLoader<CustomerPaymentMethod>(
    getCustomerPaymentMethods,
    getApiErrorHandler(errorHandler, 'usePaymentMethodsList', 'Unable to load payment methods.'),
  );
}

export function usePaymentMethodDestroyer(errorHandler?: OptionalApiErrorHandler): DataDestroyer {
  return useDataDestroyer(
    deleteCustomerPaymentMethod,
    getApiErrorHandler(errorHandler, 'usePaymentMethodDestroyer', 'Unable to delete payment method.'),
  );
}

import { getApiErrorHandler, OptionalApiErrorHandler } from '../../errors.js';
import { ItemLoader, PaginatedLoader, useItemLoader, usePaginatedLoader } from '../../loaders.js';
import { getApiErrorMessage, getOffer, getOffers, Offer, OffersPaginationRequest } from '@zenky/api';
import { useNotification } from '@zenky/ui';

export function useOffersList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<Offer> {
  return usePaginatedLoader<Offer, OffersPaginationRequest>(getOffers, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить список акций.'));
  }));
}

export function useOfferItem(errorHandler?: OptionalApiErrorHandler): ItemLoader<Offer> {
  return useItemLoader<Offer>(getOffer, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить акцию.'));
  }));
}

import { getApiErrorHandler, OptionalApiErrorHandler } from '../../errors.js';
import { ItemLoader, PaginatedLoader, useItemLoader, usePaginatedLoader } from '../../loaders.js';
import { getOffer, getOffers, Offer, OffersPaginationRequest } from '@zenky/api';

export function useOffersList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<Offer, OffersPaginationRequest> {
  return usePaginatedLoader<Offer, OffersPaginationRequest>(
    getOffers,
    getApiErrorHandler(errorHandler, 'useOffersList', 'Unable to load offers list.'),
  );
}

export function useOfferItem(errorHandler?: OptionalApiErrorHandler): ItemLoader<Offer> {
  return useItemLoader<Offer>(getOffer, getApiErrorHandler(errorHandler, 'useOfferItem', 'Unable to load offer.'));
}

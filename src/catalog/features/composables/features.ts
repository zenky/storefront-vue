import { getApiErrorHandler, OptionalApiErrorHandler } from '../../../errors.js';
import { ListLoader, useListLoader } from '../../../loaders.js';
import {
  Feature,
  FeaturesGroupContainer,
  getApiErrorMessage,
  getCategoryFeatures,
  getCategoryFeaturesGroups,
  ResourceRequest,
} from '@zenky/api';
import { useNotification } from '@zenky/ui';

export function useCategoryFeaturesList(categoryId: string | null, errorHandler?: OptionalApiErrorHandler): ListLoader<Feature> {
  return useListLoader<Feature, ResourceRequest>(
    async function (): Promise<Feature[]> {
      if (!categoryId) {
        return [];
      }

      return getCategoryFeatures(categoryId);
    },

    getApiErrorHandler(errorHandler, function (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить список фильтров.'));
    }),
  );
}

export function useCategoryFeaturesGroupsList(
  categoryId: string | null,
  errorHandler?: OptionalApiErrorHandler,
): ListLoader<FeaturesGroupContainer> {
  return useListLoader<FeaturesGroupContainer, ResourceRequest>(
    async function (): Promise<FeaturesGroupContainer[]> {
      if (!categoryId) {
        return [];
      }

      return getCategoryFeaturesGroups(categoryId);
    },

    getApiErrorHandler(errorHandler, function (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить список фильтров.'));
    }),
  );
}

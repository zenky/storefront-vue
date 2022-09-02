import { getApiErrorHandler, OptionalApiErrorHandler } from '../../../errors.js';
import { ListLoader, useListLoader } from '../../../loaders.js';
import {
  Feature,
  FeaturesGroupContainer,
  getCategoryFeatures,
  getCategoryFeaturesGroups,
  ResourceRequest,
} from '@zenky/api';

export function useCategoryFeaturesList(categoryId: string | null, errorHandler?: OptionalApiErrorHandler): ListLoader<Feature> {
  return useListLoader<Feature, ResourceRequest>(
    async function (): Promise<Feature[]> {
      if (!categoryId) {
        return [];
      }

      return getCategoryFeatures(categoryId);
    },

    getApiErrorHandler(errorHandler, 'useCategoryFeaturesList', 'Unable to load category features list.'),
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

    getApiErrorHandler(errorHandler, 'useCategoryFeaturesGroupsList', 'Unable to load category features groups list.'),
  );
}

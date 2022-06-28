import { getApiErrorHandler, OptionalApiErrorHandler } from '../errors.js';
import { ItemLoader, PaginatedLoader, useItemLoader, usePaginatedLoader } from '../loaders.js';
import {
  Article,
  ArticleCategoriesPaginationRequest,
  ArticleCategory,
  ArticlesPaginationRequest,
  getApiErrorMessage,
  getArticle,
  getArticleCategories,
  getArticles,
} from '@zenky/api';
import { useNotification } from '@zenky/ui';

export function useArticlesList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<Article> {
  return usePaginatedLoader<Article, ArticlesPaginationRequest>(getArticles, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить список статей.'));
  }));
}

export function useArticleCategoriesList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<ArticleCategory> {
  return usePaginatedLoader<ArticleCategory, ArticleCategoriesPaginationRequest>(getArticleCategories, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить список категорий статей.'));
  }));
}

export function useArticleItem(errorHandler?: OptionalApiErrorHandler): ItemLoader<Article> {
  return useItemLoader<Article>(getArticle, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить статью.'));
  }));
}

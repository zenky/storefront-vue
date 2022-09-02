import { getApiErrorHandler, OptionalApiErrorHandler } from '../errors.js';
import { ItemLoader, PaginatedLoader, useItemLoader, usePaginatedLoader } from '../loaders.js';
import {
  Article,
  ArticleCategoriesPaginationRequest,
  ArticleCategory,
  ArticlesPaginationRequest,
  getArticle,
  getArticleCategories,
  getArticles,
} from '@zenky/api';

export function useArticlesList(
  errorHandler?: OptionalApiErrorHandler,
): PaginatedLoader<Article, ArticlesPaginationRequest> {
  return usePaginatedLoader<Article, ArticlesPaginationRequest>(
    getArticles,
    getApiErrorHandler(errorHandler, 'useArticlesList', 'Unable to load articles list.'),
  );
}

export function useArticleCategoriesList(
  errorHandler?: OptionalApiErrorHandler,
): PaginatedLoader<ArticleCategory, ArticleCategoriesPaginationRequest> {
  return usePaginatedLoader<ArticleCategory, ArticleCategoriesPaginationRequest>(
    getArticleCategories,
    getApiErrorHandler(errorHandler, 'useArticleCategoriesList', 'Unable to load article categories list.'),
  );
}

export function useArticleItem(errorHandler?: OptionalApiErrorHandler): ItemLoader<Article> {
  return useItemLoader<Article>(getArticle, getApiErrorHandler(errorHandler, 'useArticleItem', 'Unable to load article.'));
}

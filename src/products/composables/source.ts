import { inject, Ref } from 'vue';
import { InjectedProductsSource, ProductsSource, ProductsSourceType } from '../types.js';
import { ZenkyInjection } from '../../injections.js';

function getInjectedSource(
  sourceInjection: ZenkyInjection,
  notFoundInjection: ZenkyInjection,
  type: string,
): ProductsSource | null {
  const source: Ref<InjectedProductsSource> | undefined = inject(sourceInjection);
  const notFound: Ref<boolean> | undefined = inject(notFoundInjection);

  if (!source) {
    return null;
  } else if (notFound && notFound.value) {
    return {
      error: true,
    };
  }

  return {
    type: type as ProductsSourceType,
    id: source.value.id,
  };
}

export function getProductsSource(source: ProductsSource | null): ProductsSource | null {
  if (source && source.type && source.id) {
    return source;
  } else if (source && source.error) {
    return null;
  }

  const injected: string | null = inject(ZenkyInjection.ProductsSource, null);

  if (!injected) {
    return null;
  }

  switch (injected) {
    case ProductsSourceType.Category:
      return getInjectedSource(ZenkyInjection.Category, ZenkyInjection.CategoryNotFound, injected);
    case ProductsSourceType.Collection:
      return getInjectedSource(ZenkyInjection.Collection, ZenkyInjection.CollectionNotFound, injected);
    default:
      return null;
  }
}

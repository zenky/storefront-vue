import { ProductsCollection } from '@zenky/api';
import { useCollectionsStore } from '../stores/collections.js';
import { computed, ref } from 'vue';
import { StateDataLoaderState, useStateDataLoader } from '../../../loaders.js';
import { ProductsCollectionProvider, ProductsCollectionsProvider } from '../types.js';

async function getCollections(): Promise<ProductsCollection[]> {
  const store = useCollectionsStore();
  const state = computed<StateDataLoaderState<ProductsCollection[]>>(() => ({
    loaded: store.loaded,
    loading: store.loading,
    data: store.collections,
  }));

  return useStateDataLoader(state, async () => store.load());
}

export function useCollections(): ProductsCollectionsProvider {
  const collections = ref<ProductsCollection[]>([]);
  const load = async (ids: string[] | null = null): Promise<void> => {
    collections.value = [];

    const items = await getCollections();

    if (ids === null) {
      collections.value = items;
    } else if (Array.isArray(ids)) {
      collections.value = items.filter((collection: ProductsCollection) => ids.indexOf(collection.id) !== -1);
    }
  };

  return {
    collections,
    load,
  };
}

export function useCollection(): ProductsCollectionProvider {
  const collection = ref<ProductsCollection | null>(null);
  const load = async (id: string): Promise<void> => {
    collection.value = null;

    const items = await getCollections();
    const index = items.findIndex((item: ProductsCollection) => item.id === id);

    if (index !== -1) {
      collection.value = items[index];
    }
  };

  return {
    collection,
    load,
  };
}

import { NestedCategory } from '@zenky/api';
import { useCategoriesStore } from '../stores/categories.js';
import { computed } from 'vue';
import { StateDataLoaderState, useStateDataLoader } from '../../../loaders.js';

export async function getTree(): Promise<NestedCategory[]> {
  const store = useCategoriesStore();
  const state = computed<StateDataLoaderState<NestedCategory[]>>(() => ({
    loaded: store.loaded,
    loading: store.loading,
    data: store.tree,
  }));

  return useStateDataLoader(state, async () => store.load());
}

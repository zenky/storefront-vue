import { defineStore } from 'pinia';
import { CollectionsState } from '../types.js';
import { getProductsCollections } from '@zenky/api';

export const useCollectionsStore = defineStore({
  id: 'zenky:storefront:collections',

  state: () => ({
    loading: false,
    loaded: false,
    collections: [],
  } as CollectionsState),

  actions: {
    async load(): Promise<void> {
      if (this.loading || this.loaded) {
        return;
      }

      this.loading = true;

      try {
        this.collections = (await getProductsCollections({
          visibility: 'visible',
          order_by: 'name',
          with: 'media',
          count: 100,
        })).items;

        this.loaded = true;
      } catch (e) {
        //
      } finally {
        this.loading = false;
      }
    },
  },
});

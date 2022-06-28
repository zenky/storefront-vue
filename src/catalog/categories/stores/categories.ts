import { defineStore } from 'pinia';
import { getCategoriesTree } from '@zenky/api';
import { CategoriesState, FlattenNestedCategory } from '../types.js';

export const useCategoriesStore = defineStore({
  id: 'zenky:storefront:categories',

  state: () => ({
    loading: false,
    loaded: false,
    tree: [],
    flatTree: null,
  } as CategoriesState),

  actions: {
    async load(): Promise<void> {
      if (this.loading || this.loaded) {
        return;
      }

      this.loading = true;

      try {
        this.tree = await getCategoriesTree({ visibility: 'visible', with: 'media' });
        this.loaded = true;
      } catch (e) {
        //
      } finally {
        this.loading = false;
      }
    },

    setFlatTree(flatTree: FlattenNestedCategory[]) {
      this.flatTree = flatTree;
    },
  },
});

import { ref } from 'vue';
import { useCategoriesStore } from '../stores/categories.js';
import { NestedCategory } from '@zenky/api';
import { getTree } from './loader.js';
import { FlatCategoriesTreeProvider, FlattenNestedCategory } from '../types.js';

const generateFlatTree = (flat: FlattenNestedCategory[], categories: NestedCategory[], append: string = '') => {
  categories.forEach((category: NestedCategory) => {
    flat.push({
      ...category,
      children: [],
      name: `${append}${category.name}`,
      original_name: category.name,
    });

    if (category.children.length > 0) {
      generateFlatTree(flat, category.children, `${append}${category.name} / `);
    }
  });
};

export function useFlatCategoriesTree(): FlatCategoriesTreeProvider {
  const tree = ref<FlattenNestedCategory[]>([]);
  const load = async () => {
    const store = useCategoriesStore();

    if (store.flatTree !== null) {
      tree.value = store.flatTree;

      return;
    }

    const flat: FlattenNestedCategory[] = [];

    generateFlatTree(flat, await getTree());

    store.setFlatTree(flat);

    tree.value = flat;
  };

  return {
    tree,
    load,
  };
}

import { ref } from 'vue';
import { NestedCategory } from '@zenky/api';
import { getTree } from './loader.js';
import { CategoriesTreeProvider } from '../types.js';

export function useCategoriesTree(): CategoriesTreeProvider {
  const tree = ref<NestedCategory[]>([]);
  const load = async () => {
    tree.value = await getTree();
  };

  return {
    tree,
    load,
  };
}

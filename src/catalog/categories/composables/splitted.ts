import { ref, Ref, unref } from 'vue';
import { NestedCategory } from '@zenky/api';
import { getTree } from './loader.js';
import { SplittedCategoriesTreeProvider } from '../types.js';

export function useSplittedCategoriesTree(): SplittedCategoriesTreeProvider {
  const visible = ref<NestedCategory[]>([]);
  const hidden = ref<NestedCategory[]>([]);
  const load = async (split: number | Ref<number>) => {
    const tree = await getTree();
    const unrefSplit = unref(split);

    visible.value = tree.slice(0, unrefSplit);
    hidden.value = tree.slice(unrefSplit);
  };

  return {
    visible,
    hidden,
    load,
  };
}

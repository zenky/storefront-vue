import { NestedCategory } from '@zenky/api';
import { ref } from 'vue';
import { getTree } from './loader.js';
import { ReversedTreeProvider } from '../types.js';

interface ReversedTreeResult {
  category: NestedCategory;
  stack: NestedCategory[];
}

const findReversedCategories = (id: string, stack: NestedCategory[], categories: NestedCategory[]): ReversedTreeResult | null => {
  for (let i = 0; i < categories.length; ++i) {
    if (categories[i].id === id || categories[i].short_id === id) {
      return {
        category: categories[i],
        stack,
      };
    }

    stack.push(categories[i]);

    const children: ReversedTreeResult | null = findReversedCategories(id, stack, categories[i].children);

    if (children !== null) {
      return children;
    } else {
      stack.pop();
    }
  }

  return null;
};

export function useReversedTree(): ReversedTreeProvider {
  const tree = ref<NestedCategory[]>([]);
  const load = async (id: string) => {
    const stack: NestedCategory[] = [];
    const result = findReversedCategories(id, stack, await getTree());

    if (result === null) {
      return;
    }

    tree.value = [...result.stack, result.category];
  };

  return {
    tree,
    load,
  };
}

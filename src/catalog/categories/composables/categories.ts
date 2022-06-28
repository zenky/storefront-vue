import { NestedCategory } from '@zenky/api';
import {  ref } from 'vue';
import { getTree } from './loader.js';
import { CategoriesProvider, CategoryProvider } from '../types.js';

const findCategory = (items: NestedCategory[], id: string): NestedCategory | null => {
  for (let i = 0; i < items.length; ++i) {
    if (items[i].id === id || items[i].short_id === id) {
      return items[i];
    }

    const children: NestedCategory | null = findCategory(items[i].children, id);

    if (children !== null) {
      return children;
    }
  }

  return null;
};

export function useCategories(): CategoriesProvider {
  const categories = ref<NestedCategory[]>([]);
  const load = async (ids: string[]) => {
    const tree = await getTree();

    ids.forEach((id: string) => {
      const category: NestedCategory | null = findCategory(tree, id);

      if (category !== null) {
        categories.value.push(category);
      }
    });
  };

  return {
    categories,
    load,
  };
}

export function useCategory(): CategoryProvider {
  const category = ref<NestedCategory | null>(null);
  const load = async (id: string) => {
    const tree = await getTree();
    category.value = findCategory(tree, id);
  };

  return {
    category,
    load,
  };
}


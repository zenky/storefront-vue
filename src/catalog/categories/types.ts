import { Ref } from 'vue';
import { NestedCategory } from '@zenky/api';

export type CategoriesState = {
  loading: boolean;
  loaded: boolean;
  tree: NestedCategory[];
  flatTree: FlattenNestedCategory[] | null;
};

export interface CategoriesProvider {
  categories: Ref<NestedCategory[]>;
  load: (ids: string[]) => void;
}

export interface CategoryProvider {
  category: Ref<NestedCategory | null>;
  load: (id: string) => void;
}

export interface FlattenNestedCategory extends NestedCategory {
  original_name: string | null;
}

export interface FlatCategoriesTreeProvider {
  tree: Ref<FlattenNestedCategory[]>;
  load: Function;
}

export interface ReversedTreeProvider {
  tree: Ref<NestedCategory[]>;
  load: (id: string) => void;
}

export interface SplittedCategoriesTreeProvider {
  visible: Ref<NestedCategory[]>;
  hidden: Ref<NestedCategory[]>;
  load: (split: number | Ref<number>) => void;
}

export interface CategoriesTreeProvider {
  tree: Ref<NestedCategory[]>;
  load: Function;
}

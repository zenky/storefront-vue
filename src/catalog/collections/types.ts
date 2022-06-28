import { ProductsCollection } from '@zenky/api';
import { Ref } from 'vue';

export type CollectionsState = {
  loading: boolean;
  loaded: boolean;
  collections: ProductsCollection[];
};

export interface ProductsCollectionsProvider {
  collections: Ref<ProductsCollection[]>;
  load: (ids: string[] | null) => Promise<void>;
}

export interface ProductsCollectionProvider {
  collection: Ref<ProductsCollection | null>;
  load: (id: string) => Promise<void>;
}

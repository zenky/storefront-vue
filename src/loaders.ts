import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { PaginatedResponse, Pagination, PaginationRequest, ResourceRequest } from '@zenky/api';
import { ApiErrorHandler } from './errors.js';

export interface LoaderState {
  loading: boolean;
  loaded: boolean;
}

export interface StateDataLoaderState<T> extends LoaderState {
  data: T;
}

export type StateDataLoader = () => any;

export async function useStateDataLoader<T>(state: ComputedRef<StateDataLoaderState<T>>, loader: StateDataLoader): Promise<T> {
  if (state.value.loaded) {
    // Data was already loaded, return it.

    return state.value.data;
  } else if (state.value.loading) {
    // If data is in loading state, return promise that will be resolved after data loaded.

    return new Promise(function (resolve: Function) {
      const loaded: ComputedRef<boolean> = computed<boolean>(() => state.value.loaded);
      const stop = watch(loaded, function (val: boolean) {
        if (val) {
          resolve(state.value.data);
          stop();
        }
      }, { immediate: true });
    });
  }

  // Data is not loading nor was loaded, dispatch loader now.

  await loader();

  return state.value.data;
}

export interface PaginatedLoaderState extends LoaderState {
  waiting: boolean;
}

export interface PaginatedLoader<T, R = PaginationRequest> {
  state: Ref<PaginatedLoaderState>;
  pagination: Ref<Pagination | null>;
  items: Ref<T[]>;
  load: (request: R, reset: boolean) => Promise<void>;
}

export type PaginatedItemsProvider<T, R = PaginationRequest> = (request: R) => Promise<PaginatedResponse<T>>;

export function usePaginatedLoader<T, R = PaginationRequest>(
  provider: PaginatedItemsProvider<T, R>,
  errorHandler: ApiErrorHandler,
): PaginatedLoader<T, R> {
  const state = ref<PaginatedLoaderState>({
    waiting: false,
    loading: false,
    loaded: false,
  });

  const pagination = ref<Pagination | null>(null);
  const items: Ref<T[]> = ref([]);

  const load = async (request: R, reset: boolean = false): Promise<void> => {
    if (state.value.loading) {
      return;
    }

    if (reset) {
      state.value.loaded = false;
    }

    state.value.loading = true;

    if (!state.value.loaded) {
      state.value.waiting = true;
    }

    try {
      const {
        pagination: currentPagination,
        items: currentItems,
      } = await provider(request);

      pagination.value = currentPagination;

      if (reset) {
        items.value = currentItems;
      } else {
        currentItems.forEach((item: T) => items.value.push(item));
      }
    } catch (e) {
      errorHandler(e);
    } finally {
      state.value.loading = false;
      state.value.waiting = false;
      state.value.loaded = true;
    }
  };

  return {
    state,
    pagination,
    items,
    load,
  };
}

export interface ListLoader<T, R = ResourceRequest> {
  state: Ref<LoaderState>;
  items: Ref<T[]>;
  load: (request?: R) => Promise<void>;
}

export type ListProvider<T, R = ResourceRequest> = (request?: R) => Promise<T[]>;

export function useListLoader<T, R = ResourceRequest>(
  provider: ListProvider<T, R>,
  errorHandler: ApiErrorHandler,
): ListLoader<T, R> {
  const state = ref<LoaderState>({
    loading: false,
    loaded: false,
  });
  const items: Ref<T[]> = ref([]);
  const load = async (request?: R): Promise<void> => {
    if (state.value.loading || state.value.loaded) {
      return;
    }

    state.value.loading = true;

    try {
      items.value = await provider(request);
    } catch (e) {
      errorHandler(e);
    } finally {
      state.value.loading = false;
      state.value.loaded = true;
    }
  };

  return {
    state,
    items,
    load,
  };
}

export interface ItemLoader<T, I = string, R = ResourceRequest> {
  state: Ref<LoaderState>;
  item: Ref<T | null>;
  load: (id: I, request?: R) => Promise<void>;
}

export type ItemProvider<T, I = string, R = ResourceRequest> = (id: I, request?: R) => Promise<T | null>;

export function useItemLoader<T, I = string, R = ResourceRequest>(
  provider: ItemProvider<T, I, R>,
  errorHandler: ApiErrorHandler,
): ItemLoader<T, I, R> {
  const state = ref<LoaderState>({
    loading: false,
    loaded: false,
  });
  const item: Ref<T | null> = ref(null);
  const load = async (id: I, request?: R): Promise<void> => {
    if (state.value.loading || state.value.loaded) {
      return;
    }

    state.value.loading = true;

    try {
      item.value = await provider(id, request);
    } catch (e) {
      errorHandler(e);
    } finally {
      state.value.loading = false;
      state.value.loaded = true;
    }
  };

  return {
    state,
    item,
    load,
  };
}

export interface DataLoader<T> {
  state: Ref<LoaderState>;
  data: Ref<T | null>;
  load: () => Promise<void>;
}

export type DataProvider<T> = () => Promise<T>;

export function useDataLoader<T>(
  provider: DataProvider<T>,
  errorHandler: ApiErrorHandler,
): DataLoader<T> {
  const state = ref<LoaderState>({
    loading: false,
    loaded: false,
  });
  const data: Ref<T | null> = ref(null);
  const load = async (): Promise<void> => {
    if (state.value.loading || state.value.loaded) {
      return;
    }

    state.value.loading = true;

    try {
      data.value = await provider();
    } catch (e) {
      errorHandler(e);
    } finally {
      state.value.loading = false;
      state.value.loaded = true;
    }
  };

  return {
    state,
    data,
    load,
  };
}

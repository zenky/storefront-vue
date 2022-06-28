import { ref, Ref } from 'vue';
import { ApiErrorHandler } from './errors.js';

export interface DataDestroyer {
  destroying: Ref<boolean>;
  destroy: (id: string) => Promise<boolean>;
}

export interface ConfirmableDataDestroyer extends DataDestroyer {
  confirm: () => void;
}

export type DataDestroyerHandler = (id: string) => any;

export function useDataDestroyer(destroyer: DataDestroyerHandler, errorHandler: ApiErrorHandler): DataDestroyer {
  const destroying = ref<boolean>(false);
  const destroy = async (id: string): Promise<boolean> => {
    if (destroying.value) {
      return false;
    }

    destroying.value = true;

    try {
      await destroyer(id);

      return true;
    } catch (e) {
      errorHandler(e);
    } finally {
      destroying.value = false;
    }

    return false;
  };

  return {
    destroying,
    destroy,
  };
}

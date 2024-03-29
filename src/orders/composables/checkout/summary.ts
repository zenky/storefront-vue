import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { checkoutOrder, getApiError } from '@zenky/api';
import { useOrderStore } from '../../stores/order.js';
import { useStoreStore } from '../../../store/index.js';
import { OrderCheckoutResult, OrderCheckoutResultReason, OrderCheckoutResultType } from '../../types.js';

export function useCheckoutSummary(emit: (event: string, payload?: any) => any) {
  const orderStore = useOrderStore();
  const { credentials, settings } = storeToRefs(orderStore);
  const { store, city } = storeToRefs(useStoreStore());
  const form = ref({
    persons_count: '',
    notes: '',
  });

  const hasPersonsCount = computed(() => {
    if (!settings.value) {
      return false;
    }

    const index = settings.value.options.findIndex((option: any) => option.kind === 'persons_count');

    return index !== -1;
  });

  const saving = ref(false);
  const save = async (): Promise<OrderCheckoutResult> => {
    if (!credentials.value) {
      return {
        type: OrderCheckoutResultType.Failed,
        reason: OrderCheckoutResultReason.OrderNotReady,
      };
    } else if (saving.value) {
      return {
        type: OrderCheckoutResultType.Failed,
        reason: OrderCheckoutResultReason.InProgress,
      };
    }

    const payload: any = {
      notes: form.value.notes,
    };

    if (hasPersonsCount.value && form.value.persons_count) {
      payload.persons_count = form.value.persons_count;
    }

    saving.value = true;

    try {
      const response = await checkoutOrder(credentials.value, payload);

      if (response.confirmation.required) {
        emit('confirmation', {
          credentials: credentials.value,
          method: response.confirmation.method,
        });
      } else {
        emit('completed', response);
      }

      if (store.value && city.value) {
        await orderStore.recreate(store.value.id, city.value.id);
      }

      return {
        type: OrderCheckoutResultType.Completed,
      };
    } catch (e) {
      return {
        type: OrderCheckoutResultType.Failed,
        reason: OrderCheckoutResultReason.ApiError,
        error: getApiError(e),
      };
    } finally {
      saving.value = false;
    }
  };

  return {
    form,
    hasPersonsCount,
    saving,
    save,
  };
}

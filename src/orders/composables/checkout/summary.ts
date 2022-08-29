import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { checkoutOrder, getApiErrorMessage } from '@zenky/api';
import { useNotification } from '@zenky/ui';
import { useOrderStore } from '../../stores/order.js';
import { useStoreStore } from '../../../store/index.js';

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
  const save = async () => {
    if (!credentials.value) {
      return;
    } else if (saving.value) {
      return;
    }

    const payload = {
      notes: form.value.notes,
    };

    if (hasPersonsCount.value && form.value.persons_count) {
      payload.notes = `Персон: ${form.value.persons_count}\n\n${payload.notes}`.trim();
    }

    saving.value = true;

    try {
      const response = await checkoutOrder(credentials.value, payload);

      if (response.confirmation_required) {
        emit('confirmation', credentials.value);
      } else {
        emit('completed', response);
      }

      if (store.value && city.value) {
        await orderStore.recreate(store.value.id, city.value.id);
      }
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось оформить заказ.'));
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

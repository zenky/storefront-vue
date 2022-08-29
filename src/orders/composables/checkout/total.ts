import { storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';
import { getOrderCheckoutTotal, OrderCheckoutTotal } from '@zenky/api';
import { useOrderStore } from '../../stores/order.js';

export function useCheckoutTotal() {
  const { credentials } = storeToRefs(useOrderStore());
  const loading = ref(false);
  const total: Ref<OrderCheckoutTotal | null> = ref(null);
  const load = async () => {
    if (loading.value) {
      return;
    } else if (!credentials.value) {
      return;
    }

    loading.value = true;

    try {
      total.value = await getOrderCheckoutTotal(credentials.value);
    } catch (e) {
      //
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    load,
    total,
  };
}

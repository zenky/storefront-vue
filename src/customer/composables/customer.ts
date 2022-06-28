import { useCustomerStore } from '../stores/customer.js';
import { computed, ComputedRef } from 'vue';
import { Customer } from '@zenky/api';

export function useCustomer(): { customer: ComputedRef<Customer | null>, loaded: ComputedRef<boolean> } {
  const store = useCustomerStore();
  const customer = computed(() => store.customer);
  const loaded = computed(() => store.loaded);

  return {
    customer,
    loaded,
  };
}

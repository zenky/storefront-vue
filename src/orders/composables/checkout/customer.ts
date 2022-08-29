import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useNotification } from '@zenky/ui';
import { getApiErrorMessage, setOrderCheckoutCustomer } from '@zenky/api';
import { useCustomerStore } from '../../../customer/index.js';
import { useOrderStore } from '../../stores/order.js';

export function useCustomerCheckoutForm(emit: (event: string) => any) {
  const ready = ref(false);
  const saving = ref(false);
  const form = ref({
    phone: {
      number: '',
      country: 'RU',
    },
    first_name: '',
    last_name: '',
  });

  const { customer } = storeToRefs(useCustomerStore());
  const { order, credentials } = storeToRefs(useOrderStore());

  if (order.value?.customer && order.value.customer.id) {
    form.value.phone.number = order.value.customer.phone.national;
    form.value.phone.country = order.value.customer.phone.country;
    form.value.first_name = order.value.customer.first_name || '';
    form.value.last_name = order.value.customer.last_name || '';
  } else if (customer.value && customer.value.id) {
    form.value.phone.number = customer.value.phone.national;
    form.value.phone.country = customer.value.phone.country;
    form.value.first_name = customer.value.first_name || '';
    form.value.last_name = customer.value.last_name || '';
  }

  const save = async () => {
    if (!credentials.value) {
      return;
    } else if (saving.value) {
      return;
    } else if (!form.value.phone.number || !form.value.phone.country) {
      useNotification('error', 'Ошибка', 'Нужно указать номер телефона.');

      return;
    } else if (!form.value.first_name) {
      useNotification('error', 'Ошибка', 'Нужно указать имя.');

      return;
    }

    saving.value = true;

    try {
      await setOrderCheckoutCustomer(credentials.value, form.value);

      emit('completed');
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось сохранить контактные данные.'));
    } finally {
      saving.value = false;
    }
  };

  return {
    ready,
    saving,
    customer,
    form,
    save,
  };
}

import { storeToRefs } from 'pinia';
import { computed, Ref, ref } from 'vue';
import {
  Address,
  Customer,
  getApiErrorMessage,
  getCustomerAddresses,
  Order,
  OrderSettings,
  setOrderCheckoutDelivery,
  Stock,
} from '@zenky/api';
import { useNotification } from '@zenky/ui';
import { format } from 'date-fns';
import { getAddressForm, useAddressFormValue } from '../../../addresses/index.js';
import { useOrderStore } from '../../stores/order.js';
import { useCustomerStore } from '../../../customer/index.js';
import { useStoreStore } from '../../../store/index.js';
import { useTotalPrice } from '../order.js';

function getDeliveryMethod(order: Ref<Order | null>, settings: Ref<OrderSettings | null>) {
  if (!order.value || !settings.value) {
    return 'delivery';
  }

  const methods = settings.value.delivery_methods.map((method) => method.id);

  if (methods.indexOf(order.value.delivery_method.id) !== -1) {
    return order.value.delivery_method.id;
  }

  return methods[0];
}

function getStockId(order: Ref<Order | null>, stocks: Ref<Stock[]>) {
  const availableStocks = stocks.value.map((stock) => stock.id);

  if (order.value && order.value.stock_id !== null && availableStocks.indexOf(order.value.stock_id) !== -1) {
    return order.value.stock_id;
  }

  return availableStocks[0];
}

function useCustomerAddresses(customer: Ref<Customer | null>) {
  const addresses: Ref<Address[]> = ref([]);
  const loaded = ref(false);

  if (!customer.value || !customer.value.id) {
    loaded.value = true;
  } else {
    getCustomerAddresses({ count: 100 }).then((response) => {
      addresses.value = response.items;
      loaded.value = true;
    });
  }

  return {
    addresses,
    loaded,
  };
}

function getDeliveryPayload(form: any, addressesResolver: string) {
  const data: any = { delivery_method: form.method };
  const errors = [];

  if (form.method === 'pickup') {
    if (form.pickup.stock_id) {
      data.stock_id = form.pickup.stock_id;
    } else {
      errors.push('Нужно выбрать точку самовывоза.');
    }
  } else if (form.method === 'on_premise') {
    if (form.on_premise.stock_id) {
      data.stock_id = form.on_premise.stock_id;
    } else {
      errors.push('Нужно выбрать точку самовывоза.');
    }

    if (form.on_premise.table) {
      data.on_premise = { table: form.on_premise.table };
    } else {
      errors.push('Нужно указать номер стола.');
    }
  } else if (form.method === 'delivery') {
    if (form.delivery.address.id) {
      data.delivery_address = { id: form.delivery.address.id };
    } else {
      const { errors: addressErrors, data: address } = useAddressFormValue(
        form.delivery.address,
        addressesResolver,
      );

      if (addressErrors.length > 0) {
        errors.push(addressErrors[0]);
      } else {
        data.delivery_address = address;
      }
    }
  }

  if (form.deliver_at.mode === 'select' && form.deliver_at.date) {
    data.deliver_at = format(Date.parse(form.deliver_at.date), 'yyyy-MM-dd HH:mm');
  }

  return {
    data,
    errors,
  };
}

export function useDeliveryCheckoutForm(emit: (event: string) => any) {
  const { credentials, order, settings } = storeToRefs(useOrderStore());
  const { customer } = storeToRefs(useCustomerStore());
  const { stocks, addressesResolver } = storeToRefs(useStoreStore());
  const { addresses, loaded } = useCustomerAddresses(customer);
  const { totalPrice } = useTotalPrice();
  const ready = computed(() => loaded.value);
  const currentAddress = computed(() => order.value?.delivery_address);
  const saving = ref(false);

  const form = ref({
    method: getDeliveryMethod(order, settings),
    delivery: {
      address: getAddressForm(),
    },
    pickup: {
      stock_id: getStockId(order, stocks),
    },
    on_premise: {
      stock_id: getStockId(order, stocks),
      table: '',
    },
    deliver_at: {
      mode: 'asap',
      date: '',
    },
  });

  form.value.delivery.address.id = order.value?.delivery_address?.id || '';

  if (order.value?.deliver_at_local?.datetime) {
    form.value.deliver_at.mode = 'select';
    form.value.deliver_at.date = format(Date.parse(order.value.deliver_at_local.iso), 'yyyy-MM-dd HH:mm');
  }

  const priceIsNotEnough = computed(() => {
    const method = settings.value?.delivery_methods.find((item) => item.id === form.value.method);

    if (!method || !method.min_price || !method.min_price.value) {
      return false;
    }

    return method.min_price.value > (totalPrice.value?.value || 0);
  });

  const save = async () => {
    if (!credentials.value || !addressesResolver.value) {
      return;
    } else if (saving.value) {
      return;
    }

    const { data, errors } = getDeliveryPayload(form.value, addressesResolver.value);

    if (errors.length > 0) {
      useNotification('error', 'Ошибка', errors[0]);

      return;
    }

    saving.value = true;

    try {
      await setOrderCheckoutDelivery(credentials.value, data);

      emit('completed');
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось сохранить способ доставки.'));
    } finally {
      saving.value = false;
    }
  };

  return {
    ready,
    form,
    addresses,
    currentAddress,
    addressesResolver,
    priceIsNotEnough,
    saving,
    save,
  };
}

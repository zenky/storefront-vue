import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { Order } from '@zenky/api';
import { useOrderStore } from '../../stores/order.js';
import { useCustomerStore } from '../../../customer/index.js';

function useStageDetectors(order: Order) {
  const hasCustomer = () => !!order.customer && !!order.customer.id;
  const hasDelivery = () => {
    if (['pickup', 'on_premise'].indexOf(order.delivery_method.id) > -1) {
      return !!order.stock && !!order.stock.id;
    }

    return !!order?.delivery_address && !!order?.delivery_address?.id;
  };

  return {
    hasCustomer,
    hasDelivery,
  };
}

export enum CheckoutStage {
  Customer = 'customer',
  Delivery = 'delivery',
  Payments = 'payments',
  Summary = 'summary',
}

export function useOrderCheckout() {
  const currentStage = ref(CheckoutStage.Customer);
  const stages = ref({
    [CheckoutStage.Customer]: {
      active: false,
      completed: false,
    },
    [CheckoutStage.Delivery]: {
      active: false,
      completed: false,
    },
    [CheckoutStage.Payments]: {
      active: false,
      completed: false,
    },
    [CheckoutStage.Summary]: {
      active: false,
      completed: false,
    },
  });
  const { order, settingsLoaded } = storeToRefs(useOrderStore());
  const { loaded: customerLoaded } = storeToRefs(useCustomerStore());
  const ready = computed(() => {
    if (!order.value || !order.value.id || !order.value.token) {
      return false;
    } else if (!customerLoaded.value) {
      return false;
    } else if (!settingsLoaded.value) {
      return false;
    }

    return true;
  });

  const setStage = (newStage: CheckoutStage) => {
    currentStage.value = newStage;

    Object.keys(stages.value).forEach((key: string) => {
      stages.value[key as CheckoutStage].active = false;
      stages.value[key as CheckoutStage].completed = false;
    });

    stages.value[newStage].active = true;

    switch (newStage) {
      case CheckoutStage.Customer:
        break;
      case CheckoutStage.Delivery:
        stages.value.customer.completed = true;
        break;
      case CheckoutStage.Payments:
        stages.value.customer.completed = true;
        stages.value.delivery.completed = true;
        break;
      case CheckoutStage.Summary:
        stages.value.customer.completed = true;
        stages.value.delivery.completed = true;
        stages.value.payments.completed = true;
        break;
      default:
        console.error(`[checkout] Unknown stage provided: "${newStage}", resetting to customer stage.`);
        stages.value.customer.completed = false;
        stages.value.delivery.completed = false;
        stages.value.payments.completed = false;
        break;
    }
  };

  watch(ready, () => {
    if (!ready.value || order.value === null) {
      return setStage(CheckoutStage.Customer);
    }

    const detectors = useStageDetectors(order.value);

    if (!detectors.hasCustomer()) {
      return setStage(CheckoutStage.Customer);
    } else if (!detectors.hasDelivery()) {
      return setStage(CheckoutStage.Delivery);
    }

    return setStage(CheckoutStage.Payments);
  }, { immediate: true });

  return {
    ready,
    order,
    stages,
    currentStage,
    setStage,
  };
}

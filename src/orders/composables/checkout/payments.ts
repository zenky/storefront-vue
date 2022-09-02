import { computed, Ref, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import {
  getApiError,
  getOrderBonusesPaymentPreview,
  Order,
  OrderCredentials,
  OrderSettings,
  setOrderCheckoutPayment,
} from '@zenky/api';
import { debounce } from 'lodash-es';
import { useOrderStore } from '../../stores/order.js';
import {
  BillSuggestion,
  BillSuggestionType,
  OrderCheckoutResult,
  OrderCheckoutResultReason,
  OrderCheckoutResultType,
} from '../../types.js';

function getPaymentMethod(settings: Ref<OrderSettings | null>) {
  if (!settings.value) {
    return 'cash';
  }

  const available = settings.value.payment_methods.map((method) => method.id);

  return available[0];
}

export function useBillSuggestions(
  unpaidAmount: Ref<number>,
  staticAmounts: number[] = [10, 50, 200, 5000],
  availableBills: number[] = [100, 500, 1000],
) {
  const getClosestMultipleOf = (price: number, amount: number) => Math.ceil(price / amount) * amount;
  const suggestions = computed(() => {
    const items = new Set([
      ...staticAmounts,
      ...availableBills.map((billItem) => getClosestMultipleOf(unpaidAmount.value, billItem)),
      unpaidAmount.value,
    ]);

    const bills: BillSuggestion[] = [...items]
      .filter((suggestion) => suggestion > unpaidAmount.value)
      .sort((first, second) => (first - second))
      .map((amount) => ({
        value: amount,
        type: BillSuggestionType.Bill,
      }));

    bills.unshift({
      type: BillSuggestionType.NoChange,
      value: '',
    });

    bills.push({
      type: BillSuggestionType.Custom,
      value: 'custom',
    });

    return bills;
  });

  return {
    suggestions,
  };
}

function useBonusesPreviewChecker(
  order: Ref<Order | null>,
  credentials: Ref<OrderCredentials | null>,
  bonuses: Ref<string>,
  setBonuses: (value: string) => any,
) {
  const bonusesAreChecking = ref(false);
  const unpaidAmount = ref(order.value?.total_price);

  const bonusesChecker = async () => {
    if (!credentials.value) {
      return;
    } else if (bonusesAreChecking.value) {
      return;
    } else if (!bonuses.value) {
      unpaidAmount.value = order.value?.total_price;

      return;
    }

    bonusesAreChecking.value = true;

    try {
      const preview = await getOrderBonusesPaymentPreview(credentials.value, bonuses.value);
      unpaidAmount.value = preview.unpaid;

      if (parseFloat(bonuses.value) > parseFloat(preview.bonuses.trimmed)) {
        setBonuses(preview.bonuses.trimmed);
      }
    } catch (e) {
      //
    } finally {
      bonusesAreChecking.value = false;
    }
  };

  watch(bonuses, debounce(async () => bonusesChecker(), 1000));

  return {
    unpaidAmount,
    bonusesAreChecking,
  };
}

function getPaymentsPayload(form: any) {
  const payments = [];

  if (parseFloat(form.bonuses) > 0.0) {
    payments.push({
      method: 'bonuses',
      amount: form.bonuses,
    });
  }

  const payment: any = { method: form.method };

  if (form.method === 'cash' && form.bill) {
    payment.bill = form.bill;
  } else if (form.method === 'card_token') {
    payment.card_token_id = form.card_token_id;
  } else if (form.method === 'cloudpayments') {
    payment.save_card = form.save_card === true;
  }

  payments.push(payment);

  return payments;
}

export function useDeliveryPaymentsForm(emit: (event: string) => any) {
  const { order, credentials, settings } = storeToRefs(useOrderStore());
  const form = ref({
    method: getPaymentMethod(settings),
    bill: '',
    save_card: false,
    bonuses: '',
    card_token_id: '',
  });
  const saving = ref(false);

  const bonuses = computed(() => form.value.bonuses);
  const { unpaidAmount, bonusesAreChecking } = useBonusesPreviewChecker(
    order,
    credentials,
    bonuses,
    (amount) => {
      form.value.bonuses = amount;
    },
  );

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

    const payments = getPaymentsPayload(form.value);

    try {
      await setOrderCheckoutPayment(credentials.value, { payments });
      emit('completed');

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
    unpaidAmount,
    bonusesAreChecking,
    saving,
    save,
  };
}

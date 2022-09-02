import { computed, Ref, ref } from 'vue';
import { confirmOrder, getApiError, Order, resendOrderConfirmationCode } from '@zenky/api';
import { OrderCheckoutResult, OrderCheckoutResultReason, OrderCheckoutResultType } from '../../types.js';

export function useCheckoutConfirmation(order: Ref<Order>) {
  const form = ref({ code: '' });
  const confirming = ref(false);
  const resending = ref(false);
  const credentials = computed(() => ({
    id: order.value.id,
    token: order.value.token,
  }));

  const confirm = async (): Promise<OrderCheckoutResult> => {
    if (confirming.value) {
      return {
        type: OrderCheckoutResultType.Failed,
        reason: OrderCheckoutResultReason.InProgress,
      };
    } else if (!form.value.code) {
      return {
        type: OrderCheckoutResultType.Validation,
        reason: OrderCheckoutResultReason.CodeRequired,
      };
    }

    confirming.value = true;

    try {
      const response = await confirmOrder(credentials.value, form.value);

      return {
        type: OrderCheckoutResultType.Completed,
        data: response,
      };
    } catch (e) {
      return {
        type: OrderCheckoutResultType.Failed,
        reason: OrderCheckoutResultReason.ApiError,
        error: getApiError(e),
      };
    } finally {
      confirming.value = false;
    }
  };

  const resendCode = async (): Promise<OrderCheckoutResult> => {
    if (resending.value) {
      return {
        type: OrderCheckoutResultType.Failed,
        reason: OrderCheckoutResultReason.InProgress,
      };
    }

    resending.value = true;

    try {
      const result = await resendOrderConfirmationCode(credentials.value);

      if (result.success) {
        return {
          type: OrderCheckoutResultType.Completed,
        };
      }

      return {
        type: OrderCheckoutResultType.Failed,
        reason: OrderCheckoutResultReason.Cooldown,
      };
    } catch (e) {
      return {
        type: OrderCheckoutResultType.Failed,
        reason: OrderCheckoutResultReason.ApiError,
        error: getApiError(e),
      };
    } finally {
      resending.value = false;
    }
  };

  return {
    form,
    confirming,
    confirm,
    resending,
    resendCode,
  };
}

import { computed, Ref, ref } from 'vue';
import { useNotification } from '@zenky/ui';
import { confirmOrder, getApiErrorMessage, Order, resendOrderConfirmationCode } from '@zenky/api';

export function useCheckoutConfirmation(order: Ref<Order>) {
  const form = ref({ code: '' });
  const confirming = ref(false);
  const resending = ref(false);
  const credentials = computed(() => ({
    id: order.value.id,
    token: order.value.token,
  }));

  const confirm = async () => {
    if (confirming.value) {
      return null;
    } else if (!form.value.code) {
      useNotification('error', 'Ошибка', 'Нужно указать код из SMS.');

      return null;
    }

    confirming.value = true;

    try {
      return await confirmOrder(credentials.value, form.value);
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось подтвердить заказ.'));
    } finally {
      confirming.value = false;
    }

    return null;
  };

  const resendCode = async () => {
    if (resending.value) {
      return;
    }

    resending.value = true;

    try {
      const result = await resendOrderConfirmationCode(credentials.value);

      if (result.success) {
        useNotification('success', 'Код выслан', 'Код был повторно выслан на ваш телефон.');
      } else {
        useNotification('error', 'Ошибка', 'Не удалось выслать код подтверждения. Повторите попытку позднее.');
      }
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось выслать код подтверждения.'));
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

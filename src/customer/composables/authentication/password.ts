import { ref, Ref } from 'vue';
import {
  AuthenticationEvent,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType,
  EmitAuthenticationEvent,
  PasswordResetProvider,
} from '../../types.js';
import { useTimer } from '../../../helpers/timer.js';
import { useNotification } from '@zenky/ui';
import { getApiErrorMessage, requestPasswordResetCode, resetPassword } from '@zenky/api';
import { useCustomerStore } from '../../stores/customer.js';

function useRequest(form: Ref<AuthenticationForm>, active: Ref<boolean>) {
  const { seconds, label, start } = useTimer(60);
  const sent = ref<boolean>(false);

  const request = async (): Promise<AuthenticationResult> => {
    if (active.value) {
      return {
        type: AuthenticationResultType.Pending,
      };
    } else if (seconds.value > 0) {
      useNotification('error', 'Ошибка', 'Нужно подождать перед повторной отправкой кода сброса пароля.');

      return {
        type: AuthenticationResultType.Pending,
      };
    } else if (!form.value.phone.number || !form.value.phone.country) {
      useNotification('error', 'Ошибка', 'Нужно указать номер телефона.');

      return {
        type: AuthenticationResultType.Validation,
        data: 'phone',
      };
    }

    active.value = true;

    try {
      await requestPasswordResetCode(form.value.phone);

      useNotification('success', 'Код отправлен', 'Код сброса пароля был отправлен на ваш номер.');
      sent.value = true;
      start();

      return {
        type: AuthenticationResultType.Completed,
      };
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Нужно подождать перед повторной отправкой кода сброса пароля.'));
    } finally {
      active.value = false;
    }

    return {
      type: AuthenticationResultType.Failed,
    };
  };

  return {
    seconds,
    label,
    request,
    sent,
  };
}

function useReset(form: Ref<AuthenticationForm>, active: Ref<boolean>, emit: EmitAuthenticationEvent) {
  const reset = async (): Promise<AuthenticationResult> => {
    if (active.value) {
      return {
        type: AuthenticationResultType.Pending,
      };
    } else if (!form.value.phone.number || !form.value.phone.country) {
      useNotification('error', 'Ошибка', 'Нужно указать номер телефона.');

      return {
        type: AuthenticationResultType.Validation,
        data: 'phone',
      };
    } else if (!form.value.password) {
      useNotification('error', 'Ошибка', 'Нужно придумать новый пароль.');

      return {
        type: AuthenticationResultType.Validation,
        data: 'password',
      };
    } else if (!form.value.confirmation_code) {
      useNotification('error', 'Ошибка', 'Нужно указать код из SMS.');

      return {
        type: AuthenticationResultType.Validation,
        data: 'confirmation_code',
      };
    }

    active.value = true;

    try {
      const result = await resetPassword(form.value.phone, form.value.confirmation_code, form.value.password);

      const store = useCustomerStore();
      await store.setToken(result.token);

      useNotification('success', 'Пароль изменён', 'Вы успешно изменили пароль и вошли в свой аккаунт.');

      emit(AuthenticationEvent.Completed);

      return {
        type: AuthenticationResultType.Completed,
        data: result.customer,
      };
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Указан неправильный код сброса пароля.'));
    } finally {
      active.value = false;
    }

    return {
      type: AuthenticationResultType.Failed,
    };
  };

  return {
    reset,
  };
}

export function usePasswordReset(form: Ref<AuthenticationForm>, emit: EmitAuthenticationEvent): PasswordResetProvider {
  const active = ref<boolean>(false);
  const { request, sent, seconds, label } = useRequest(form, active);
  const { reset } = useReset(form, active, emit);

  return {
    active,
    sent,
    seconds,
    label,
    request,
    reset,
  };
}

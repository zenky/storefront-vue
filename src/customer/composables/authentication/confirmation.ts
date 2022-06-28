import { useNotification } from '@zenky/ui';
import { confirm as confirmRegistration, getApiErrorCode, getApiErrorMessage, resendConfirmationCode } from '@zenky/api';
import {
  AuthenticationEvent,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType, ConfirmationProvider,
  EmitAuthenticationEvent,
} from '../../types.js';
import { ref, Ref } from 'vue';
import { useTimer } from '../../../helpers/timer.js';
import { useCustomerStore } from '../../stores/customer.js';

function useResend(form: Ref<AuthenticationForm>, active: Ref<boolean>) {
  const { seconds, label, start } = useTimer(60);

  const resend = async (): Promise<AuthenticationResult> => {
    if (active.value) {
      return {
        type: AuthenticationResultType.Pending,
      };
    } else if (seconds.value > 0) {
      useNotification('error', 'Ошибка', 'Нужно подождать перед повторной отправкой кода подтверждения.');

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
      await resendConfirmationCode(form.value.phone);

      start();

      return {
        type: AuthenticationResultType.Completed,
      };
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Нужно подождать перед повторной отправкой кода подтверждения.'));
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
    start,
    resend,
  };
}

function useConfirm(form: Ref<AuthenticationForm>, active: Ref<boolean>, emit: EmitAuthenticationEvent) {
  const confirm = async (withPassword: boolean = false): Promise<AuthenticationResult> => {
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
    } else if (!form.value.confirmation_code) {
      useNotification('error', 'Ошибка', 'Нужно указать код из SMS.');

      return {
        type: AuthenticationResultType.Validation,
        data: 'confirmation_code',
      };
    } else if (withPassword && !form.value.password) {
      useNotification('error', 'Ошибка', 'Нужно указать новый пароль.');

      return {
        type: AuthenticationResultType.Validation,
        data: 'password',
      };
    }

    active.value = true;

    try {
      const result = await confirmRegistration(
        form.value.phone,
        form.value.confirmation_code,
        withPassword ? form.value.password : null,
      );

      const store = useCustomerStore();
      await store.setToken(result.token);

      useNotification('success', 'Успешное подтверждение телефона', 'Вы успешно подтвердили телефон и вошли в свой аккаунт.');

      emit(AuthenticationEvent.Completed);

      return {
        type: AuthenticationResultType.Completed,
        data: result.customer,
      };
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Указан неправильный код подтверждения.'));

      if (getApiErrorCode(e) === 'auth.registration.password_required') {
        return {
          type: AuthenticationResultType.Validation,
          data: 'password',
        };
      }
    } finally {
      active.value = false;
    }

    return {
      type: AuthenticationResultType.Failed,
    };
  };

  return {
    confirm,
  };
}

export const usePhoneConfirmation = (form: Ref<AuthenticationForm>, emit: EmitAuthenticationEvent): ConfirmationProvider => {
  const active = ref<boolean>(false);
  const { seconds, label, start, resend } = useResend(form, active);
  const { confirm } = useConfirm(form, active, emit);

  return {
    active,
    seconds,
    label,
    start,
    resend,
    confirm,
  };
};

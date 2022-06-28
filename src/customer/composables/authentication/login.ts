import { ref, Ref } from 'vue';
import {
  AuthenticationEvent,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType,
  EmitAuthenticationEvent, LoginProvider,
} from '../../types.js';
import { useNotification } from '@zenky/ui';
import { getApiErrorMessage, login as signIn } from '@zenky/api';
import { useCustomerStore } from '../../stores/customer.js';

export function useLogin(
  form: Ref<AuthenticationForm>,
  emit: EmitAuthenticationEvent,
): LoginProvider {
  const active = ref<boolean>(false);
  const login = async (): Promise<AuthenticationResult> => {
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
      useNotification('error', 'Ошибка', 'Нужно указать пароль.');

      return {
        type: AuthenticationResultType.Validation,
        data: 'password',
      };
    }

    active.value = true;

    try {
      const { token } = await signIn(
        { number: form.value.phone.number, country: form.value.phone.country },
        form.value.password,
      );

      const { setToken } = useCustomerStore();
      const customer = await setToken(token);

      useNotification('success', 'Успешный вход', 'Вы успешно вошли в ваш аккаунт!');
      emit(AuthenticationEvent.Completed);

      return {
        type: AuthenticationResultType.Completed,
        data: customer,
      };
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Указан неправильный пароль.'));
    } finally {
      active.value = false;
    }

    return {
      type: AuthenticationResultType.Failed,
    };
  };

  return {
    active,
    login,
  };
}

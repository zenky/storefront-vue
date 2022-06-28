import { ref, Ref } from 'vue';
import { useNotification } from '@zenky/ui';
import { getApiErrorMessage, register as registerAccount } from '@zenky/api';
import {
  AuthenticationEvent,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType,
  AuthenticationStage,
  EmitAuthenticationEvent, RegistrationProvider,
} from '../../types.js';

export function useRegistration(
  form: Ref<AuthenticationForm>,
  emit: EmitAuthenticationEvent,
): RegistrationProvider {
  const active = ref<boolean>(false);
  const register = async (): Promise<AuthenticationResult> => {
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
      useNotification('error', 'Ошибка', 'Нужно придумать пароль.');

      return {
        type: AuthenticationResultType.Validation,
        data: 'password',
      };
    }

    active.value = true;

    try {
      const result = await registerAccount(form.value.phone, form.value.password);

      if (!result.confirmation_required) {
        emit(AuthenticationEvent.Completed);

        useNotification('success', 'Успешная регистрация', 'Вы успешно зарегистрировались!');

        return {
          type: AuthenticationResultType.Completed,
        };
      }

      emit(AuthenticationEvent.Stage, AuthenticationStage.Confirmation);

      return {
        type: AuthenticationResultType.Stage,
        data: AuthenticationStage.Confirmation,
      };
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Этот телефон уже зарегистрирован.'));
    } finally {
      active.value = false;
    }

    return {
      type: AuthenticationResultType.Failed,
    };
  };

  return {
    active,
    register,
  };
}

import { ref, Ref } from 'vue';
import {
  AuthenticationEvent,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType,
  AuthenticationStage,
  AuthenticationStatusCheckerProvider,
  EmitAuthenticationEvent,
} from '../../types.js';
import { useNotification } from '@zenky/ui';
import { getApiErrorMessage, getAuthenticationStatus } from '@zenky/api';

export function useAuthenticationStatusChecker(
  form: Ref<AuthenticationForm>,
  emit: EmitAuthenticationEvent,
): AuthenticationStatusCheckerProvider {
  const active = ref<boolean>(false);
  const check = async (): Promise<AuthenticationResult> => {
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
    }

    active.value = true;

    try {
      const status = await getAuthenticationStatus(form.value.phone);

      if (!status.registered) {
        emit(AuthenticationEvent.Stage, AuthenticationStage.Register);

        return {
          type: AuthenticationResultType.Completed,
          data: AuthenticationStage.Register,
        };
      } else if (!status.confirmed) {
        emit(AuthenticationEvent.Stage, AuthenticationStage.Confirmation);

        return {
          type: AuthenticationResultType.Completed,
          data: AuthenticationStage.Confirmation,
        };
      }

      emit(AuthenticationEvent.Stage, AuthenticationStage.Login);

      return {
        type: AuthenticationResultType.Completed,
        data: AuthenticationStage.Login,
      };
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось проверить статус регистрации. Повторите попытку.'));
    } finally {
      active.value = false;
    }

    return {
      type: AuthenticationResultType.Failed,
    };
  };

  return {
    active,
    check,
  };
}

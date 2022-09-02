import { ref, Ref } from 'vue';
import {
  AuthenticationEvent,
  AuthenticationFailureReason,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType,
  AuthenticationStage,
  AuthenticationStatusCheckerProvider,
  EmitAuthenticationEvent,
} from '../../types.js';
import { getApiError, getAuthenticationStatus } from '@zenky/api';

export function useAuthenticationStatusChecker(
  form: Ref<AuthenticationForm>,
  emit: EmitAuthenticationEvent,
): AuthenticationStatusCheckerProvider {
  const active = ref<boolean>(false);
  const check = async (): Promise<AuthenticationResult> => {
    if (active.value) {
      return {
        type: AuthenticationResultType.Failed,
        reason: AuthenticationFailureReason.InProgress,
      };
    } else if (!form.value.phone.number || !form.value.phone.country) {
      return {
        type: AuthenticationResultType.Validation,
        reason: AuthenticationFailureReason.PhoneRequired,
      };
    }

    active.value = true;

    try {
      const status = await getAuthenticationStatus(form.value.phone);

      if (!status.registered) {
        emit(AuthenticationEvent.Stage, AuthenticationStage.Register);

        return {
          type: AuthenticationResultType.Stage,
          data: AuthenticationStage.Register,
        };
      } else if (!status.confirmed) {
        emit(AuthenticationEvent.Stage, AuthenticationStage.Confirmation);

        return {
          type: AuthenticationResultType.Stage,
          data: AuthenticationStage.Confirmation,
        };
      }

      emit(AuthenticationEvent.Stage, AuthenticationStage.Login);

      return {
        type: AuthenticationResultType.Stage,
        data: AuthenticationStage.Login,
      };
    } catch (e) {

      return {
        type: AuthenticationResultType.Failed,
        reason: AuthenticationFailureReason.ApiError,
        error: getApiError(e),
      };
    } finally {
      active.value = false;
    }
  };

  return {
    active,
    check,
  };
}

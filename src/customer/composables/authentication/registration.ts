import { ref, Ref } from 'vue';
import { getApiError, register as registerAccount } from '@zenky/api';
import {
  AuthenticationEvent,
  AuthenticationFailureReason,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType,
  AuthenticationStage,
  EmitAuthenticationEvent,
  RegistrationProvider,
} from '../../types.js';

export function useRegistration(
  form: Ref<AuthenticationForm>,
  emit: EmitAuthenticationEvent,
): RegistrationProvider {
  const active = ref<boolean>(false);
  const register = async (): Promise<AuthenticationResult> => {
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
    } else if (!form.value.password) {
      return {
        type: AuthenticationResultType.Validation,
        reason: AuthenticationFailureReason.PasswordRequired,
      };
    }

    active.value = true;

    try {
      const result = await registerAccount(form.value.phone, form.value.password);

      if (!result.confirmation_required) {
        emit(AuthenticationEvent.Completed);

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
    register,
  };
}

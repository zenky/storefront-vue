import { ref, Ref } from 'vue';
import {
  AuthenticationEvent,
  AuthenticationFailureReason,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType,
  EmitAuthenticationEvent,
  LoginProvider,
} from '../../types.js';
import { getApiError, login as signIn } from '@zenky/api';
import { useCustomerStore } from '../../stores/customer.js';

export function useLogin(
  form: Ref<AuthenticationForm>,
  emit: EmitAuthenticationEvent,
): LoginProvider {
  const active = ref<boolean>(false);
  const login = async (): Promise<AuthenticationResult> => {
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
      const { token } = await signIn(
        { number: form.value.phone.number, country: form.value.phone.country },
        form.value.password,
      );

      const { setToken } = useCustomerStore();
      const customer = await setToken(token);

      emit(AuthenticationEvent.Completed);

      return {
        type: AuthenticationResultType.Completed,
        data: customer,
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
    login,
  };
}

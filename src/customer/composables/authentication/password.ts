import { ref, Ref } from 'vue';
import {
  AuthenticationEvent,
  AuthenticationFailureReason,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType,
  EmitAuthenticationEvent,
  PasswordResetProvider,
} from '../../types.js';
import { useTimer } from '../../../helpers/timer.js';
import { getApiError, requestPasswordResetCode, resetPassword } from '@zenky/api';
import { useCustomerStore } from '../../stores/customer.js';

function useRequest(form: Ref<AuthenticationForm>, active: Ref<boolean>) {
  const { seconds, label, start } = useTimer(60);
  const sent = ref<boolean>(false);

  const request = async (): Promise<AuthenticationResult> => {
    if (active.value) {
      return {
        type: AuthenticationResultType.Failed,
        reason: AuthenticationFailureReason.InProgress,
      };
    } else if (seconds.value > 0) {
      return {
        type: AuthenticationResultType.Failed,
        reason: AuthenticationFailureReason.Cooldown,
      };
    } else if (!form.value.phone.number || !form.value.phone.country) {
      return {
        type: AuthenticationResultType.Validation,
        reason: AuthenticationFailureReason.PhoneRequired,
      };
    }

    active.value = true;

    try {
      await requestPasswordResetCode(form.value.phone);

      sent.value = true;
      start();

      return {
        type: AuthenticationResultType.Completed,
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
    } else if (!form.value.confirmation_code) {
      return {
        type: AuthenticationResultType.Validation,
        reason: AuthenticationFailureReason.CodeRequired,
      };
    }

    active.value = true;

    try {
      const result = await resetPassword(form.value.phone, form.value.confirmation_code, form.value.password);

      const store = useCustomerStore();
      await store.setToken(result.token);

      emit(AuthenticationEvent.Completed);

      return {
        type: AuthenticationResultType.Completed,
        data: result.customer,
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

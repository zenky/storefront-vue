import { confirm as confirmRegistration, getApiError, getApiErrorCode, resendConfirmationCode } from '@zenky/api';
import {
  AuthenticationEvent,
  AuthenticationFailureReason,
  AuthenticationForm,
  AuthenticationResult,
  AuthenticationResultType,
  ConfirmationProvider,
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
      await resendConfirmationCode(form.value.phone);

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
    start,
    resend,
  };
}

function useConfirm(form: Ref<AuthenticationForm>, active: Ref<boolean>, emit: EmitAuthenticationEvent) {
  const confirm = async (withPassword: boolean = false): Promise<AuthenticationResult> => {
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
    } else if (!form.value.confirmation_code) {
      return {
        type: AuthenticationResultType.Validation,
        reason: AuthenticationFailureReason.CodeRequired,
      };
    } else if (withPassword && !form.value.password) {
      return {
        type: AuthenticationResultType.Validation,
        reason: AuthenticationFailureReason.PasswordRequired,
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

      emit(AuthenticationEvent.Completed);

      return {
        type: AuthenticationResultType.Completed,
        data: result.customer,
      };
    } catch (e) {
      if (getApiErrorCode(e) === 'auth.registration.password_required') {
        return {
          type: AuthenticationResultType.Validation,
          reason: AuthenticationFailureReason.PasswordRequired,
        };
      }

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

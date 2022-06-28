import { AuthenticationForm, AuthenticationFormProvider, AuthenticationStage } from '../../types.js';
import { ref } from 'vue';

export function useAuthenticationForm(): AuthenticationFormProvider {
  const stage = ref<AuthenticationStage>(AuthenticationStage.Check);
  const form = ref<AuthenticationForm>({
    phone: {
      number: '',
      country: '',
    },
    password: '',
    confirmation_code: '',
  });
  const reset = () => {
    form.value.phone.country = 'RU';
    form.value.phone.number = '';
    form.value.password = '';
    form.value.confirmation_code = '';
    stage.value = AuthenticationStage.Check;
  };

  return {
    stage,
    form,
    reset,
  };
}

import { useCustomerStore } from '../../stores/customer.js';
import { LogoutProvider } from '../../types.js';

export function useLogout(): LogoutProvider {
  const logout = (): void => {
    const store = useCustomerStore();

    store.logout();
  };

  return {
    logout,
  };
}

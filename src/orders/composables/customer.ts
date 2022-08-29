import { useCustomerAuthenticated } from '@zenky/events';
import { Customer, OrderCredentials, setOrderCheckoutCustomer } from '@zenky/api';

export function initializeOrderCustomer(credentialsResolver: () => OrderCredentials | null) {
  useCustomerAuthenticated().subscribe('order.customer.initialize', async ({ customer }: { customer: Customer }) => {
    const credentials = credentialsResolver();

    if (credentials === null) {
      return;
    }

    try {
      await setOrderCheckoutCustomer(credentials, {
        phone: {
          number: customer.phone.e164,
          country: customer.phone.country,
        },
      });
    } catch (e) {
      console.error('[orders/customer] Unable to attach customer to order.', { e });
    }
  });
}

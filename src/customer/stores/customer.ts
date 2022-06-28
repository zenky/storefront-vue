import { defineStore } from 'pinia';
import { CustomerStore } from '../types.js';
import { getStorage } from '../../storage.js';
import { getCustomerProfile, setAxiosToken } from '@zenky/api';
import { useCustomerAuthenticated, useCustomerLoaded, useCustomerLoggedOut } from '@zenky/events';

export const useCustomerStore = defineStore({
  id: 'zenky:storefront:customer',

  state: () => ({
    inclusions: '',
    loading: false,
    loaded: false,
    token: null,
    customer: null,
  } as CustomerStore),

  actions: {
    async initialize(inclusions: string) {
      this.inclusions = inclusions;

      const storage = getStorage();
      this.token = storage.get('customer.token', null);
      this.loaded = false;

      if (!this.token) {
        this.loaded = true;

        return;
      }

      return this.load();
    },

    async load() {
      if (this.loading || !this.token) {
        return null;
      }

      this.loading = true;

      try {
        setAxiosToken(this.token);

        this.customer = await getCustomerProfile(this.inclusions);

        useCustomerLoaded().publish({ customer: this.customer });

        return this.customer;
      } catch (e) {
        setAxiosToken();
      } finally {
        this.loading = false;
        this.loaded = true;
      }

      return null;
    },

    async setToken(token: string) {
      this.token = token;

      const storage = getStorage();
      storage.set('customer.token', token);

      const customer = await this.load();

      useCustomerAuthenticated().publish({ customer });

      return customer;
    },

    logout() {
      this.token = null;
      this.customer = null;

      const storage = getStorage();
      storage.delete('customer.token');

      setAxiosToken();

      useCustomerLoggedOut().publish();
    },
  },
});

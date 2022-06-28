import { defineStore } from 'pinia';
import { City, getStore, Stock, Store, StoreSettings } from '@zenky/api';
import { getStorage } from '../../storage.js';

export interface StoreState {
  loading: boolean;
  loaded: boolean;
  store: Store | null;
  storeId: string;
  cityId: string | null;
}

export const useStoreStore = defineStore({
  id: 'zenky:storefront:store',
  state: (): StoreState => {
    const storage = getStorage();

    return {
      loading: false,
      loaded: false,
      store: null,
      storeId: (window as any).zenky.storeId,
      cityId: storage.get('cityId'),
    };
  },

  getters: {
    cities(): City[] {
      if (!this.loaded || !this.store || !this.store.cities) {
        return [];
      }

      return this.store.cities;
    },

    city(): City | null {
      if (!this.cityId) {
        return null;
      }

      return this.cities.find((city: City) => city.id === this.cityId) || null;
    },

    stocks(): Stock[] {
      if (!this.city || !this.city.stocks) {
        return [];
      }

      return this.city.stocks.filter((stock: Stock) => stock.visible);
    },

    settings(): StoreSettings | null {
      if (!this.store || !this.store.settings) {
        return null;
      }

      return this.store.settings;
    },

    addressesResolver(): string | null {
      if (!this.settings) {
        return null;
      }

      return this.settings.addresses.resolver.id;
    },

    loyalty(): any {
      if (!this.settings) {
        return null;
      }

      return this.settings.loyalty;
    },
  },

  actions: {
    async loadStore(inclusions: string): Promise<void> {
      if (this.loading || this.loaded) {
        return;
      }

      try {
        this.store = await getStore(inclusions);
        this.loaded = true;
      } catch (e) {
        //
      } finally {
        this.loading = false;
      }
    },

    selectDefaultCity(): City | null {
      if (this.city) {
        return this.city;
      } else if (!this.cities.length) {
        return null;
      }

      return this.selectCity(this.cities[0].id);
    },

    selectCity(cityId: string): City | null {
      const city = this.cities.find((item: City) => item.id === cityId);

      if (!city) {
        return null;
      }

      const storage = getStorage();
      storage.set('cityId', city.id);

      this.cityId = city.id;

      return city;
    },
  },
});

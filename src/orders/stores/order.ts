import { defineStore } from 'pinia';
import { useNotification } from '@zenky/ui';
import {
  useOrderLoaded,
  useProductQuantityDecreased,
  useProductQuantityIncreased,
} from '@zenky/events';
import {
  addOrderProductVariant,
  createOrder,
  getApiErrorMessage,
  getOrderSettings,
  Order,
  OrderCredentials,
  OrderSettings,
  removeOrderProductVariant,
} from '@zenky/api';
import { OrderInclusions, OrderProductVariantPromotion, OrderStoreState } from '../types.js';
import { getStorage } from '../../storage.js';
import { useOrderItem } from '../../customer/index.js';
import { getUpdatedVariants } from '../composables/variants.js';
import { initializeOrderCustomer } from '../composables/customer.js';

export const useOrderStore = defineStore({
  id: 'zenky:storefront:order',

  state: () => ({
    order: null,
    token: null,
    loading: false,
    inclusions: null,
    orderSettings: {
      loaded: false,
      loading: false,
      settings: null,
    },
  } as OrderStoreState),

  getters: {
    credentials(): OrderCredentials | null {
      if (!this.order || !this.order.id || this.token === null) {
        return null;
      }

      return {
        id: this.order.id,
        token: this.token,
      };
    },

    settings(): OrderSettings | null {
      return this.orderSettings.settings;
    },

    settingsLoaded(): boolean {
      return this.orderSettings.loaded;
    },
  },

  actions: {
    async initialize(storeId: string, cityId: string, inclusions: OrderInclusions) {
      this.inclusions = inclusions;

      const storage = getStorage();
      const orderId = storage.get('order.id');
      const orderToken = storage.get('order.token');

      initializeOrderCustomer(() => this.credentials);

      this.loading = true;

      if (orderId && orderToken) {
        return this.load(storeId, cityId, orderId, orderToken);
      }

      return this.create(storeId, cityId);
    },

    async load(storeId: string, cityId: string, orderId: string, token: string): Promise<boolean> {
      const { item, load } = useOrderItem();
      await load({ id: orderId, token }, this.inclusions !== null ? { with: this.inclusions.order } : {});

      if (item.value?.current_status?.status?.kind.id === 'pending') {
        this.order = item.value;
        this.token = item.value.token;
        this.loading = false;

        useOrderLoaded().publish(this.order);

        await this.loadSettings();

        return true;
      }

      return this.create(storeId, cityId);
    },

    async loadSettings(): Promise<void> {
      if (this.orderSettings.loading) {
        return;
      } else if (!this.credentials || !this.order || !this.order.city_id) {
        return;
      }

      this.orderSettings.loading = true;

      try {
        this.orderSettings.settings = await getOrderSettings(this.credentials, this.order.city_id);
      } catch (e) {
        console.error('[storefront/order] Unable to load order settings.', { e });
      } finally {
        this.orderSettings.loading = false;
        this.orderSettings.loaded = true;
      }
    },

    async create(storeId: string, cityId: string): Promise<boolean> {
      try {
        const order = await createOrder({ city_id: cityId });
        const storage = getStorage();
        storage.set('order.id', order.id);
        storage.set('order.token', order.token);

        return await this.load(storeId, cityId, order.id, order.token as string);
      } catch (e) {
        useNotification('error', 'Ошибка инициализации заказа', 'Не удалось инициализировать заказ. Обновите страницу.');
      }

      return false;
    },

    reset() {
      const storage = getStorage();
      storage.delete('order.id');
      storage.delete('order.token');
    },

    async add(
      productVariantId: string,
      quantity: number,
      modifiers: any[] = [],
      promotion: OrderProductVariantPromotion | null = null,
    ): Promise<boolean> {
      if (!this.credentials) {
        throw new Error('Order is not yet initialized.');
      }

      try {
        const params: any = {
          quantity,
          modifiers,
          product_variant_id: productVariantId,
        };

        if (promotion && promotion.id && promotion.reward_id) {
          params.promotion_id = promotion.id;
          params.promotion_reward_id = promotion.reward_id;
        }

        const order = await addOrderProductVariant(
          this.credentials,
          params,
          this.inclusions !== null ? { with: this.inclusions.product } : {},
        );

        useProductQuantityIncreased().publish({
          order,
          productVariantId,
          quantity,
          modifiers,
          promotion,
        });

        this.update(order);

        return true;
      } catch (e) {
        useNotification(
          'error',
          'Товар не добавлен',
          getApiErrorMessage(e, 'Не удалось добавить товар в корзину. Повторите попытку'),
        );
      }

      return false;
    },

    async remove(
      productVariantId: string,
      quantity: number,
      modifiers: any[] = [],
      promotion: OrderProductVariantPromotion | null = null,
    ): Promise<boolean> {
      if (!this.credentials) {
        throw new Error('Order is not yet initialized.');
      }

      try {
        const params: any = {
          quantity,
          modifiers,
          product_variant_id: productVariantId,
        };

        if (promotion && promotion.id && promotion.reward_id) {
          params.promotion_id = promotion.id;
          params.promotion_reward_id = promotion.reward_id;
        }

        const order = await removeOrderProductVariant(
          this.credentials,
          params,
          this.inclusions !== null ? { with: this.inclusions.product } : {},
        );

        useProductQuantityDecreased().publish({
          order,
          productVariantId,
          quantity,
          modifiers,
          promotion,
        });

        this.update(order);

        return true;
      } catch (e) {
        useNotification(
          'error',
          'Товар не удалён',
          getApiErrorMessage(e, 'Не удалось удалить товар из корзины. Повторите попытку'),
        );
      }

      return false;
    },

    update(order: Order): void {
      if (this.order === null) {
        this.order = order;

        return;
      }

      this.order.total_price = order.total_price;
      this.order.original_total_price = order.original_total_price;
      this.order.discount_difference = order.discount_difference;
      this.order.has_discount = order.has_discount;
      this.order.variants = getUpdatedVariants(this.order, order);
    },

    async recreate(storeId: string, cityId: string, inclusions: OrderInclusions | null = null) {
      this.reset();

      if (!this.inclusions && inclusions) {
        this.inclusions = inclusions;
      }

      this.loading = true;

      return this.create(storeId, cityId);
    },
  },
});

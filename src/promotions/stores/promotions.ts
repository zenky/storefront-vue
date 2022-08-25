import { defineStore } from 'pinia';
import {
  useDisplayOrderPromotionRewardSelection,
  useOrderPromotionsNotFound,
  usePromotionsCheckerCompleted,
  usePromotionsCheckerStarted,
} from '@zenky/events';
import {
  PromotionsCheckerCompletedPayload,
  PromotionsCheckerSelector,
  PromotionsStoreState,
} from '../types.js';

export const usePromotionsStore = defineStore({
  id: 'zenky:storefront:promotions',

  state: () => ({
    checking: false,
    failed: false,
    selector: {
      available: false,
      closed: false,
      offer: null,
      promotion_id: '',
      reward_id: '',
      max_quantity: 0,
      context: null,
    },
  } as PromotionsStoreState),

  getters: {
    hasSelector(): boolean {
      if (this.checking) {
        return false;
      } else if (!this.selector.available) {
        return false;
      } else if (!this.selector.promotion_id || !this.selector.reward_id) {
        return false;
      }

      return true;
    },

    hasSelectorContext(): boolean {
      if (this.selector.context === null) {
        return false;
      }

      return !!this.selector.context.id && !!this.selector.context.type;
    },
  },

  actions: {
    setCheckerState(value: boolean, timedOut = false): void {
      this.checking = value;
      this.failed = timedOut;
    },

    disableRewardsSelector(): void {
      this.selector.available = false;
      this.selector.offer = null;
      this.selector.promotion_id = '';
      this.selector.reward_id = '';
      this.selector.max_quantity = 0;
      this.selector.context = null;
    },

    enableRewardsSelector(selector: PromotionsCheckerSelector): void {
      this.selector.available = true;
      this.selector.offer = selector.offer;
      this.selector.promotion_id = selector.promotion_id;
      this.selector.reward_id = selector.reward_id;
      this.selector.max_quantity = selector.limit;
      this.selector.context = selector.context;
    },

    closeRewardsSelector(): void {
      this.selector.closed = true;
    },

    openRewardsSelector(): void {
      this.selector.closed = false;
    },

    initialize(): void {
      usePromotionsCheckerStarted().subscribe(
        'storefront.promotions.initialize',
        () => this.setCheckerState(true),
      );

      usePromotionsCheckerCompleted().subscribe(
        'storefront.promotions.initialize',
        (params?: PromotionsCheckerCompletedPayload) => this.setCheckerState(false, params && params.timeout === true),
      );

      useDisplayOrderPromotionRewardSelection().subscribe(
        'storefront.promotions.initialize',
        ({ data }: { data: PromotionsCheckerSelector }) => this.enableRewardsSelector(data),
      );

      useOrderPromotionsNotFound().subscribe(
        'storefront.promotions.initialize',
        () => this.disableRewardsSelector(),
      );
    },
  },
});

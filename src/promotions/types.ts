import { ComputedRef } from 'vue';

export interface PromotionsSelectorContext {
  id: string;
  type: string;
}

export interface PromotionsSelectorOffer {
  id: string;
  short_id: string;
  slug: string;
}

export interface PromotionsSelector {
  available: boolean;
  closed: boolean;
  offer: PromotionsSelectorOffer | null;
  promotion_id: string;
  reward_id: string;
  max_quantity: number;
  context: PromotionsSelectorContext | null;
}

export interface PromotionsCheckerSelector {
  offer: PromotionsSelectorOffer | null;
  promotion_id: string;
  reward_id: string;
  limit: number;
  context: PromotionsSelectorContext | null;
}

export interface PromotionsStoreState {
  checking: boolean;
  failed: boolean;
  selector: PromotionsSelector;
}

export interface PromotionsCheckerCompletedPayload {
  timeout?: boolean;
}

export interface PromotionsRewardsSelectorProvider {
  checking: ComputedRef<boolean>;
  failed: ComputedRef<boolean>;
  available: ComputedRef<boolean>;
  collapsed: ComputedRef<boolean>;
  selector: ComputedRef<PromotionsSelector>,
  open: () => void;
  close: () => void;
}

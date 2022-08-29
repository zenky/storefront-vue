import { Order, OrderSettings } from '@zenky/api';

export interface OrderInclusions {
  order: string;
  product: string;
}

export interface OrderSettingsState {
  loaded: boolean;
  loading: boolean;
  settings: OrderSettings | null;
}

export interface OrderStoreState {
  order: Order | null;
  token: string | null;
  loading: boolean;
  inclusions: OrderInclusions | null;
  orderSettings: OrderSettingsState;
}

export interface OrderProductVariantPromotion {
  id: string;
  reward_id: string;
}

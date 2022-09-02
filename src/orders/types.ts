import { Order, OrderSettings, ZenkyError } from '@zenky/api';

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

export type ProductVariantControlsCallbackHandler = (type: string, result: boolean) => void;

export enum OrderCheckoutResultType {
  Validation = 'validation',
  Completed = 'completed',
  Failed = 'failed',
}

export enum OrderCheckoutResultReason {
  InProgress = 'in_progress',
  Cooldown = 'cooldown',
  ApiError = 'api_error',
  OrderNotReady = 'order_not_ready',
  PhoneRequired = 'phone_required',
  FirstNameRequired = 'first_name_required',
  CodeRequired = 'code_required',
  AddressError = 'address_error',
}

export interface OrderCheckoutResult {
  type: OrderCheckoutResultType;
  reason?: OrderCheckoutResultReason;
  data?: any;
  error?: ZenkyError | null;
}

export enum BillSuggestionType {
  Bill = 'bill',
  NoChange = 'no_change',
  Custom = 'custom',
}

export interface BillSuggestion {
  type: BillSuggestionType,
  value: string | number;
}

export enum ZenkyWebsocketEvent {
  OrderPriceRecalculated = 'orders.price.recalculated',
  OrderMustBeReloaded = 'orders.reload',
  OrderRewardsMustBeReloaded = 'orders.rewards.reload',
  DisplayOrderRewardsSelection = 'orders.rewards.display_selection',
  PromotionsNotFound = 'orders.promotions.not_found',
}

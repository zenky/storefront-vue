import Pusher from 'pusher-js';
import { Order, Store } from '@zenky/api';
import {
  useDisplayOrderPromotionRewardSelection,
  useOrderPriceRecalculated,
  useOrderPromotionRewardsShouldBeReloaded, useOrderPromotionsNotFound,
  useOrderShouldBeReloaded, useOrderSubmitted, usePromotionsCheckerCompleted,
} from '@zenky/events';
import { ZenkyWebsocketEvent } from '../types.js';

let instance: Pusher | null = null;

export function createWebsocketsConnection(store: Store): Pusher {
  if (instance !== null) {
    return instance;
  } else if (typeof store.settings === 'undefined' || store.settings === null) {
    throw new Error('You must provide store with settings.');
  } else if (typeof store.settings.websockets === 'undefined' || store.settings.websockets === null) {
    throw new Error('You must provide store with websockets settings.');
  }

  instance = new Pusher(store.settings.websockets.app_key, {
    wsHost: store.settings.websockets.options.host,
    wsPort: store.settings.websockets.options.port,
    forceTLS: false,
    enableStats: false,
    enabledTransports: ['ws', 'wss'],
  });

  return instance;
}

export function getWebsocketsConnection(): Pusher {
  if (instance === null) {
    throw new Error('You must create websockets connection using [createWebsocketsConnection] function.');
  }

  return instance;
}

export function subscribeToOrderEvents(order: Order) {
  if (instance === null) {
    throw new Error('You must create websocket connection using `createWebsocketConnection` function!');
  }

  const channel = instance.subscribe(`orders.${order.id}.${order.token}`);

  channel.bind(ZenkyWebsocketEvent.OrderPriceRecalculated, (data: any) => {
    useOrderPriceRecalculated().publish({ order, data });
  });

  channel.bind(ZenkyWebsocketEvent.OrderMustBeReloaded, () => {
    useOrderShouldBeReloaded().publish({ order });
  });

  channel.bind(ZenkyWebsocketEvent.OrderRewardsMustBeReloaded, () => {
    useOrderPromotionRewardsShouldBeReloaded().publish({ order });
  });

  channel.bind(ZenkyWebsocketEvent.DisplayOrderRewardsSelection, (data: any) => {
    useDisplayOrderPromotionRewardSelection().publish({ order, data });
    usePromotionsCheckerCompleted().publish();
  });

  channel.bind(ZenkyWebsocketEvent.PromotionsNotFound, () => {
    useOrderPromotionsNotFound().publish({ order });
    usePromotionsCheckerCompleted().publish();
  });

  useOrderSubmitted().subscribe('websockets.subscribe', ({ order: submittedOrder }: { order: Order }) => {
    if (instance === null) {
      throw new Error('You must create websocket connection using `createWebsocketConnection` function!');
    }

    instance.unsubscribe(`orders.${submittedOrder.id}.${submittedOrder.token}`);
  });
}

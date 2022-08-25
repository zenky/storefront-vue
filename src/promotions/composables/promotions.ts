import {
  useProductQuantityDecreased,
  useProductQuantityIncreased,
  usePromotionsCheckerCompleted,
  usePromotionsCheckerStarted,
} from '@zenky/events';
import { checkCompletedPromotions, Order } from '@zenky/api';
import { computed } from 'vue';
import { usePromotionsStore } from '../stores/promotions.js';
import { PromotionsRewardsSelectorProvider } from '../types.js';

export function initializePromotions(order: Order, timeout = 10000) {
  const promotionsStore = usePromotionsStore();
  promotionsStore.initialize();

  const promotionsAreChecking = computed(() => promotionsStore.checking);
  let manualTimeout: number | undefined = undefined;

  const checker = async () => {
    if (promotionsAreChecking.value) {
      return;
    }

    if (manualTimeout) {
      clearTimeout(manualTimeout);
    }

    usePromotionsCheckerStarted().publish();

    await checkCompletedPromotions({ id: order.id, token: order.token as string });

    manualTimeout = setTimeout(() => {
      if (promotionsAreChecking.value) {
        usePromotionsCheckerCompleted().publish({ timeout: true });
      }
    }, timeout);
  };

  useProductQuantityIncreased().subscribe('promotions.init', checker);
  useProductQuantityDecreased().subscribe('promotions.init', checker);

  checkCompletedPromotions({ id: order.id, token: order.token as string }).then(() => {
    console.log('[storefront/promotions] Promotions checker has been initialized.');
  });
}

export function useRewardsSelector(): PromotionsRewardsSelectorProvider {
  const promotionsStore = usePromotionsStore();
  const selector = computed(() => promotionsStore.selector);
  const checking = computed(() => promotionsStore.checking);
  const failed = computed(() => promotionsStore.failed);
  const available = computed(() => selector.value.available);
  const collapsed = computed(() => selector.value.closed);
  const close = () => promotionsStore.closeRewardsSelector();
  const open = () => promotionsStore.openRewardsSelector();

  return {
    checking,
    failed,
    available,
    collapsed,
    selector,
    open,
    close,
  };
}

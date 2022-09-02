import { storeToRefs } from 'pinia';
import { useOrderStore } from '../stores/order.js';
import { computed, ComputedRef, ref, Ref, watch } from 'vue';
import { OrderProductVariant, ProductVariant } from '@zenky/api';
import { OrderProductVariantPromotion, ProductVariantControlsCallbackHandler } from '../types.js';
import { debounce } from 'lodash-es';

export function useTotalPrice() {
  const { order } = storeToRefs(useOrderStore());

  return {
    totalPrice: computed(() => order.value?.total_price),
    originalTotalPrice: computed(() => order.value?.original_total_price),
    hasDiscount: computed(() => order.value?.has_discount),
    discountDifference: computed(() => order.value?.discount_difference),
  };
}

export function useTotalQuantity() {
  const { order } = storeToRefs(useOrderStore());

  const quantity = computed(() => {
    if (!order.value) {
      return 0;
    }

    return (order.value?.variants || [])
      .map((variant: OrderProductVariant) => variant.quantity)
      .reduce((variantQuantity: number, total: number) => variantQuantity + total, 0);
  });

  return {
    order,
    quantity,
  };
}

export function useOrderVariants() {
  const { order } = storeToRefs(useOrderStore());
  const variants = computed(() => {
    if (!order.value || !order.value.variants || !order.value.variants.length) {
      return [];
    }

    return order.value.variants;
  });

  return {
    variants,
  };
}

export const useVariantControls = (
  variant: Ref<ProductVariant>,
  modifiers: Ref<any[]>,
  modifiersHash: Ref<string | null>,
  promotion: Ref<OrderProductVariantPromotion | null>,
  callback?: ProductVariantControlsCallbackHandler,
) => {
  const { order } = storeToRefs(useOrderStore());
  const { add: addVariant, remove: removeVariant } = useOrderStore();
  const loading = ref(false);
  const operation: Ref<string | null> = ref(null);
  const orderVariant: ComputedRef<OrderProductVariant | null | undefined> = computed(() => {
    if (!order.value?.variants?.length) {
      return null;
    }

    return order.value.variants.find((item) => {
      if (item.product_variant_id !== variant.value.id || item.modifiers_hash !== modifiersHash.value) {
        return false;
      } else if (promotion.value === null) {
        return item.promotion_id === null;
      }

      return item.promotion_id === promotion.value.id && item.promotion_reward_id === promotion.value.reward_id;
    });
  });

  const totalQuantity = computed(() => (orderVariant.value ? orderVariant.value.quantity : 0));
  const quantityModel: Ref<string | number> = ref(totalQuantity.value);

  const updateVariant = async (type: string, quantity: number) => {
    if (loading.value) {
      return;
    }

    loading.value = true;
    operation.value = type;
    let result: boolean;

    if (type === 'add') {
      result = await addVariant(variant.value.id, quantity, modifiers.value, promotion.value);
    } else {
      result = await removeVariant(variant.value.id, quantity, modifiers.value, promotion.value);
    }

    if (typeof callback === 'function') {
      callback(type, result);
    }

    loading.value = false;
  };

  const add = async () => updateVariant('add', 1);
  const remove = async () => updateVariant('remove', totalQuantity.value);

  const getQuantity = (value: string | number): number => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }

    return value;
  };

  const increase = async (quantity: number = 1) => {
    quantityModel.value = getQuantity(quantityModel.value) + quantity;
  };

  const decrease = async (quantity: number = 1) => {
    quantityModel.value = Math.max(0, getQuantity(quantityModel.value) - quantity);
  };

  watch(totalQuantity, () => {
    quantityModel.value = totalQuantity.value;
  });

  watch(quantityModel, debounce(async (val: string | number) => {
    const difference = getQuantity(val) - totalQuantity.value;

    if (difference < 0) {
      await updateVariant('remove', Math.abs(difference));
    } else if (difference > 0) {
      await updateVariant('add', difference);
    }
  }, 1000));

  return {
    orderVariant,
    totalQuantity,
    quantityModel,
    add,
    increase,
    decrease,
    remove,
    loading,
    operation,
  };
};

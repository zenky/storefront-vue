import { computed, ComputedRef, Ref, ref } from 'vue';
import { getProductVariantPrice, ProductVariant, ProductVariantPriceCalculationResult } from '@zenky/api';
import { storeToRefs } from 'pinia';
import { CalculatedProductVariantPrice, ProductVariantPriceCalcuator, SelectedProductModifier } from './types.js';
import { useStoreStore } from '../../../store/index.js';

async function recalculatePrice(
  variant: ComputedRef<ProductVariant | null>,
  modifiers: Ref<SelectedProductModifier[]>,
): Promise<ProductVariantPriceCalculationResult | null> {
  if (!variant.value) {
    return null;
  } else if (!modifiers.value.length) {
    return null;
  }

  const { cityId } = storeToRefs(useStoreStore());

  try {
    return await getProductVariantPrice(variant.value.product_id, variant.value.id, modifiers.value, {
      city_id: cityId.value || undefined,
    });
  } catch (e) {
    //
  }

  return null;
}

export function getProductVariantsPricesRange(variants: ProductVariant[]) {
  if (!variants.length) {
    return null;
  }

  const sorted = [...variants].sort((first: ProductVariant, second: ProductVariant) => Math.sign(first.price.value - second.price.value));

  return {
    min: sorted[0].price,
    max: sorted[sorted.length - 1].price,
  };
}

export function useVariantPrice(variants: ProductVariant[], variant: ComputedRef<ProductVariant | null>) {
  const result: Ref<ProductVariantPriceCalculationResult | null> = ref(null);
  const recalculating: Ref<boolean> = ref(false);
  const totalPrice: ComputedRef<CalculatedProductVariantPrice | null> = computed(() => {
    if (result.value !== null) {
      return {
        recalculated: true,
        recalculating: recalculating.value,
        price: result.value.price,
        original_price: result.value.original_price,
        has_discount: result.value.has_discount,
        discount_id: result.value.discount_id,
        discount_difference: result.value.discount_difference,
        discount_percentage: result.value.discount_percentage,
      };
    } else if (!variant.value) {
      return null;
    }

    return {
      recalculated: false,
      recalculating: recalculating.value,
      price: variant.value.price,
      original_price: variant.value.original_price,
      has_discount: variant.value.has_discount,
      discount_id: variant.value.discount_id,
      discount_difference: variant.value.discount_difference,
      discount_percentage: variant.value.discount_percentage,
    };
  });

  const pricesRange = computed(() => getProductVariantsPricesRange(variants));

  const recalculate: ProductVariantPriceCalcuator = async (modifiers: Ref<SelectedProductModifier[]>): Promise<string | null> => {
    if (recalculating.value) {
      return null;
    }

    recalculating.value = true;
    result.value = await recalculatePrice(variant, modifiers);
    recalculating.value = false;

    return result.value !== null ? result.value.modifiers_hash : null;
  };

  return {
    totalPrice,
    pricesRange,
    recalculating,
    recalculate,
  };
}

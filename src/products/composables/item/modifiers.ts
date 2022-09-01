import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { Product, ProductModifier, ProductModifiersGroup, ProductVariant } from '@zenky/api';
import {
  ProductCardModifiersList,
  ProductModifiersGroupModifierModel,
  ProductModifierModel,
  SelectedProductModifier,
  ProductVariantPriceCalcuator,
} from './types.js';

export * from './modifiers/single';
export * from './modifiers/group';

function getModifiers(product: Product, variant: ComputedRef<ProductVariant | null>): ProductCardModifiersList {
  const modifiers: ProductCardModifiersList = {};

  (product?.modifiers || []).forEach((modifier: ProductModifier) => {
    modifiers[modifier.modifier.id] = {
      modifier_id: modifier.modifier.id,
      quantity: 0,
    };
  });

  (product?.modifiers_groups || []).forEach((group: ProductModifiersGroup) => {
    modifiers[group.group.id] = [];
  });

  if (!variant.value || !variant.value.selected_modifiers || !variant.value.selected_modifiers.modifiers) {
    return modifiers;
  } else if (!variant.value.selected_modifiers.modifiers.length) {
    return modifiers;
  }

  variant.value.selected_modifiers.modifiers.forEach((modifier) => {
    if (typeof modifier.modifiers_group_id !== 'undefined' && modifier.modifiers_group_id) {
      (modifiers[modifier.modifiers_group_id] as ProductModifiersGroupModifierModel[]).push(modifier);
    } else if (typeof modifier.modifier_id !== 'undefined' && modifier.modifier_id) {
      modifiers[modifier.modifier_id] = {
        modifier_id: modifier.modifier_id,
        quantity: modifier.quantity,
      };
    }
  });

  return modifiers;
}

function getSelectedModifiers(modifiers: Ref<ProductCardModifiersList>): SelectedProductModifier[] {
  const selected: SelectedProductModifier[] = [];

  Object.keys(modifiers.value).forEach((modifierId: string) => {
    const isGroup = Array.isArray(modifiers.value[modifierId]);

    if (!isGroup && !(modifiers.value[modifierId] as ProductModifierModel).quantity) {
      return;
    } else if (!isGroup) {
      selected.push({
        modifier_id: modifierId,
        quantity: (modifiers.value[modifierId] as ProductModifierModel).quantity,
      });

      return;
    }

    (modifiers.value[modifierId] as ProductModifiersGroupModifierModel[]).forEach((modifier: ProductModifiersGroupModifierModel) => {
      if (!modifier.modifier_id || !modifier.quantity || !modifier.modifiers_group_id) {
        return;
      }

      selected.push({
        modifiers_group_id: modifier.modifiers_group_id,
        modifier_id: modifier.modifier_id,
        quantity: modifier.quantity,
      });
    });
  });

  return selected;
}

export function useModifiers(product: Product, variant: ComputedRef<ProductVariant | null>, recalculate: ProductVariantPriceCalcuator) {
  const modifiersHash: Ref<string | null> = ref(variant.value?.selected_modifiers?.hash || null);
  const modifiers: Ref<ProductCardModifiersList> = ref(getModifiers(product, variant));
  const selectedModifiers: Ref<SelectedProductModifier[]> = computed(() => getSelectedModifiers(modifiers));

  watch(variant, () => {
    modifiers.value = getModifiers(product, variant);
  });

  watch(selectedModifiers, async () => {
    const hash = await recalculate(selectedModifiers);

    if (hash === null) {
      return;
    }

    modifiersHash.value = hash;
  });

  return {
    modifiers,
    selectedModifiers,
    modifiersHash,
  };
}

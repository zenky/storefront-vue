import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { ProductModifier, ProductModifiersGroup } from '@zenky/api';
import { ModifiersGroupModifiersList, ModifiersGroupProps, ProductModifiersGroupModifierModel } from '../types.js';

function getModifierQuantity(modifier: ProductModifier, value: Ref<ProductModifiersGroupModifierModel[]>): number {
  const index = value.value.findIndex((item: ProductModifiersGroupModifierModel) => item.modifier_id === modifier.modifier.id);

  if (index === -1) {
    return 0;
  }

  return value.value[index].quantity;
}

function getDefaultModifiersGroupModifiers(
  group: ProductModifiersGroup,
  value: Ref<ProductModifiersGroupModifierModel[]>,
): ModifiersGroupModifiersList {
  const modifiers: ModifiersGroupModifiersList = {};

  group.modifiers.forEach((modifier: ProductModifier) => {
    const quantity = Array.isArray(value.value) ? getModifierQuantity(modifier, value) : 0;

    modifiers[modifier.modifier.id] = {
      quantity,
      modifier_id: modifier.modifier.id,
    };
  });

  return modifiers;
}

function getSelectedModifiers(
  group: ProductModifiersGroup,
  modifiers: ModifiersGroupModifiersList,
): ProductModifiersGroupModifierModel[] {
  const selected: ProductModifiersGroupModifierModel[] = [];

  Object.keys(modifiers).forEach((modifierId) => {
    if (!modifiers[modifierId].quantity) {
      return;
    }

    selected.push({
      modifiers_group_id: group.group.id,
      modifier_id: modifierId,
      quantity: modifiers[modifierId].quantity,
    });
  });

  return selected;
}

export function useModifiersGroup(props: ModifiersGroupProps, emit: (event: string, data: any) => any) {
  const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const selectedModifier: Ref<string> = ref('');
  const modifiers: Ref<ModifiersGroupModifiersList> = ref(getDefaultModifiersGroupModifiers(props.group, value));
  const shouldUseQuantityControls: ComputedRef<boolean> = computed(() => props.group.max_quantity > 1);
  const totalSelectedCount: ComputedRef<number> = computed(() => {
    return value.value
      .map((modifier: ProductModifiersGroupModifierModel) => modifier.quantity)
      .reduce((current: number, total: number) => current + total, 0);
  });

  const limitReached: ComputedRef<boolean> = computed(() => {
    if (!shouldUseQuantityControls.value) {
      return selectedModifier.value !== '';
    }

    return totalSelectedCount.value >= props.group.max_quantity;
  });

  const requiredModifierIsMissing: ComputedRef<boolean> = computed(() => {
    if (!props.group.is_required) {
      return false;
    } else if (props.group.min_quantity === 0) {
      return false;
    }

    return totalSelectedCount.value < props.group.min_quantity;
  });

  watch(selectedModifier, (val: string | null) => {
    if (!val) {
      value.value = [];

      return;
    }

    value.value = [{
      modifiers_group_id: props.group.group.id,
      modifier_id: val,
      quantity: 1,
    }];
  });

  watch(modifiers, (val: ModifiersGroupModifiersList) => {
    value.value = getSelectedModifiers(props.group, val);
  }, { deep: true });

  return {
    selectedModifier,
    modifiers,
    shouldUseQuantityControls,
    requiredModifierIsMissing,
    limitReached,
  };
}

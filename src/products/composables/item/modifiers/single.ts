import { computed, ComputedRef, WritableComputedRef } from 'vue';
import { SingleModifierProps } from '../types.js';

export function useSingleModifier(props: SingleModifierProps, emit: (event: string, data: any) => any) {
  const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const checked: WritableComputedRef<boolean> = computed({
    get: () => value.value.quantity > 0,
    set: (val) => {
      value.value.quantity = val ? 1 : 0;
    },
  });

  const shouldUseQuantityControls: ComputedRef<boolean> = computed(() => props.modifier.max_quantity > 1);

  const increase = () => {
    if (props.limitReached) {
      return;
    }

    value.value.quantity = Math.min(value.value.quantity + 1, props.modifier.max_quantity);
  };

  const decrease = () => {
    value.value.quantity = Math.max(value.value.quantity - 1, props.modifier.min_quantity);
  };

  return {
    value,
    checked,
    shouldUseQuantityControls,
    increase,
    decrease,
  };
}

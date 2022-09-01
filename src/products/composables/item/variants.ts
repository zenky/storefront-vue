import { computed, ComputedRef, Ref, ref } from 'vue';
import { ProductVariant, VariantOptionValue } from '@zenky/api';
import { ProductCardVariantOption, SelectedVariantOptionsList } from './types.js';

function getOptionsList(variants: ProductVariant[]): ProductCardVariantOption[] {
  const options: ProductCardVariantOption[] = [];

  if (variants.length <= 1) {
    return options;
  }

  variants.forEach((variant: ProductVariant) => {
    if (!variant.option_values || !variant.option_values.length) {
      return;
    }

    variant.option_values.forEach((optionValue: VariantOptionValue) => {
      if (!optionValue.option || !optionValue.option.id) {
        return;
      }

      const optionIndex = options.findIndex((option: ProductCardVariantOption) => option.id === optionValue.option?.id);

      if (optionIndex === -1) {
        options.push({
          id: optionValue.option.id,
          name: optionValue.option.name,
          type: optionValue.option.type,
          values: [optionValue],
        });

        return;
      }

      const valueIndex = options[optionIndex].values.findIndex((item: VariantOptionValue) => item.id === optionValue.id);

      if (valueIndex !== -1) {
        return;
      }

      options[optionIndex].values.push(optionValue);
    });
  });

  return options;
}

export function useVariant(variants: ProductVariant[]) {
  const options: Ref<ProductCardVariantOption[]> = ref(getOptionsList(variants));
  const selectedOptions: Ref<SelectedVariantOptionsList> = ref({});

  options.value.forEach((option: ProductCardVariantOption) => {
    selectedOptions.value[option.id] = option.values.length > 0 ? option.values[0].id : null;
  });

  const variant: ComputedRef<ProductVariant | null> = computed(() => {
    if (!Array.isArray(variants) || !variants.length) {
      return null;
    } else if (variants.length === 1) {
      return variants[0];
    } else if (!Object.keys(selectedOptions.value).length) {
      return variants[0];
    }

    const variantIndex = variants.findIndex((item) => {
      if (!item.option_values || !item.option_values.length) {
        return false;
      }

      return item.option_values.every((optionValue: VariantOptionValue) => {
        if (!optionValue.option || !optionValue.option.id) {
          return false;
        } else if (typeof selectedOptions.value[optionValue.option.id] === 'undefined') {
          return false;
        } else if (selectedOptions.value[optionValue.option.id] !== optionValue.id) {
          return false;
        }

        return true;
      });
    });

    if (variantIndex === -1) {
      return null;
    }

    return variants[variantIndex];
  });

  return {
    variant,
    options,
    selectedOptions,
  };
}

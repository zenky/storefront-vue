import {
  Enum, Medium,
  ProductModifier,
  ProductModifiersGroup,
  ProductVariantPriceCalculation,
  VariantOptionValue,
} from '@zenky/api';
import { Ref } from 'vue';

export interface ProductModifierModel {
  quantity: number;
  modifier_id: string;
}

export interface ModifiersGroupModifiersList {
  [x: string]: ProductModifierModel;
}

export interface ProductModifiersGroupModifierModel {
  modifiers_group_id: string | null;
  modifier_id: string | null;
  quantity: number;
}

export interface ModifiersGroupProps {
  modelValue: ProductModifiersGroupModifierModel[];
  group: ProductModifiersGroup;
}

export interface SingleModifierProps {
  modelValue: ProductModifierModel;
  modifier: ProductModifier;
  limitReached: boolean;
}

export interface ProductCardModifiersList {
  [x: string]: ProductModifierModel | ProductModifiersGroupModifierModel[];
}

export interface SelectedProductModifier {
  modifier_id: string;
  quantity: number;
  modifiers_group_id?: string;
}

export type ProductVariantPriceCalcuator = (modifiers: Ref<SelectedProductModifier[]>) => Promise<string | null>;

export interface CalculatedProductVariantPrice extends ProductVariantPriceCalculation {
  recalculated: boolean;
  recalculating: boolean;
}

export interface ProductCardVariantOption {
  id: string;
  name: string | null;
  type: Enum | null;
  values: VariantOptionValue[];
}

export interface SelectedVariantOptionsList {
  [x: string]: string | null;
}

export interface ProductCardProduct {
  id: string;
  short_id: string | null;
  category_id: string | null;
  slug: string | null;
  name: string | null;
  description: string | null;
  images: Medium[];
  modifiers: ProductModifier[];
  modifiers_groups: ProductModifiersGroup[];
  variants_count: number;
  has_images: boolean;
  has_modifiers: boolean;
}

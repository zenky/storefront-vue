import { Order, OrderProductVariant } from '@zenky/api';
import { cloneDeep } from 'lodash-es';

export function getUpdatedVariants(currentOrder: Order, order: Order): OrderProductVariant[] {
  if (!order?.variants?.length) {
    return [];
  } else if (!currentOrder?.variants?.length) {
    return order?.variants || [];
  }

  let current: OrderProductVariant[] = cloneDeep(currentOrder.variants) as OrderProductVariant[];
  let currentVariants: string[] = [];
  const currentlyHasVariants = current && current.length > 0;

  if (currentlyHasVariants) {
    currentVariants = current.map((variant) => variant.uuid);
  }

  const actualVariantIds = order.variants.map((variant) => variant.uuid);
  const createdVariantIds = order.variants
    .filter((variant) => currentVariants.indexOf(variant.uuid) === -1)
    .map((variant) => variant.uuid);

  if (currentlyHasVariants) {
    current = current.filter((variant) => actualVariantIds.indexOf(variant.uuid) !== -1);
  }

  if (createdVariantIds.length > 0) {
    current = current || [];

    order.variants.filter((variant) => createdVariantIds.indexOf(variant.uuid) !== -1)
      .forEach((variant) => current.push(variant));
  }

  order.variants.forEach((variant) => {
    const index = current.findIndex((item) => item.uuid === variant.uuid);

    if (index === -1) {
      return;
    }

    current[index].quantity = variant.quantity;
    current[index].original_total_price = variant.original_total_price;
    current[index].total_price = variant.total_price;
    current[index].discount_difference = variant.discount_difference;
    current[index].has_discount = variant.has_discount;
  });

  return current;
}

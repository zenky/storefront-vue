import { isBoolean } from 'lodash-es';
import { Address } from '@zenky/api';
import { getExistedAddress, getSelectedAddress } from './dadata/dadata.js';

export interface AddressForm {
  id?: string;
  name?: string;
  suggestion?: any | null;
  city: string;
  street: string;
  house: string;
  block: string;
  address: string;
  apartment: string;
  entrance: string;
  floor: string;
  has_intercom: boolean;
}

export const getAddressForm = (): AddressForm => ({
  suggestion: null,
  id: '',
  city: '',
  street: '',
  house: '',
  block: '',
  address: '',
  apartment: '',
  entrance: '',
  floor: '',
  has_intercom: true,
});

export interface AddressFormValue {
  address?: string;
  city?: string;
  street?: string;
  house?: string;
  block?: string;
  apartment: string;
  entrance: string;
  floor: string;
  has_intercom: boolean;
}
export interface AddressFormValueProvider {
  errors: string[];
  data: AddressFormValue;
}

export function useAddressFormValue(
  form: AddressForm,
  resolver: string,
  address?: Address | null,
): AddressFormValueProvider {
  const errors = [];
  let data: any = {};

  if (resolver === 'dadata') {
    if (form.suggestion) {
      data = {
        address: getSelectedAddress(form.suggestion, form.house, form.block),
        apartment: form.apartment,
        entrance: form.entrance,
        floor: form.floor,
        has_intercom: isBoolean(form.has_intercom)
          ? form.has_intercom
          : form.has_intercom === 'true',
      } as AddressFormValue;
    } else if (address) {
      data = {
        address: getExistedAddress(address, form.house, form.block),
        apartment: form.apartment,
        entrance: form.entrance,
        floor: form.floor,
        has_intercom: isBoolean(form.has_intercom)
          ? form.has_intercom
          : form.has_intercom === 'true',
      } as AddressFormValue;
    } else {
      errors.push('Нужно выбрать улицу из выпадающего списка.');
    }
  } else if (resolver === 'plain') {
    if (!form.city) {
      errors.push('Нужно указать город.');
    } else if (!form.street) {
      errors.push('Нужно указать улицу.');
    } else if (!form.house) {
      errors.push('Нужно указать номер дома.');
    } else {
      data = {
        city: form.city,
        street: form.street,
        house: form.house,
        block: form.block,
        apartment: form.apartment,
        entrance: form.entrance,
        floor: form.floor,
        has_intercom: isBoolean(form.has_intercom)
          ? form.has_intercom
          : form.has_intercom === 'true',
      } as AddressFormValue;
    }
  }

  return {
    data,
    errors,
  };
}

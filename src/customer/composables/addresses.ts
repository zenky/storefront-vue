import { getApiErrorHandler, OptionalApiErrorHandler } from '../../errors.js';
import { PaginatedLoader, usePaginatedLoader } from '../../loaders.js';
import { Address, deleteAddress, getApiErrorMessage, getCustomerAddresses, updateAddress } from '@zenky/api';
import { useNotification } from '@zenky/ui';
import { DataDestroyer, useDataDestroyer } from '../../destroyers.js';
import { EditAddressFormProvider } from '../types.js';
import { AddressForm, getExistedAddressDisplayValue, useAddressFormValue } from '../../addresses/index.js';
import { ref } from 'vue';

export function useDeliveryAddressesList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<Address> {
  return usePaginatedLoader<Address>(getCustomerAddresses, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось загрузить адреса доставки.'));
  }));
}

export function useDeliveryAddressDestroyer(errorHandler?: OptionalApiErrorHandler): DataDestroyer {
  return useDataDestroyer(deleteAddress, getApiErrorHandler(errorHandler, function (e) {
    useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось удалить адрес доставки.'));
  }));
}

export function useEditAddressForm(address: Address): EditAddressFormProvider {
  const addressFields = address.resolver === 'plain' ? {
    id: address.id,
    name: address.name,
    city: address?.city?.short,
    street: address?.street?.short,
    house: address.house,
    block: address.block || '',
    apartment: address.apartment,
    entrance: address.entrance,
    floor: address.floor,
    has_intercom: address.has_intercom,
  } as AddressForm : {
    id: address.id,
    name: address.name,
    address: getExistedAddressDisplayValue(address, false),
    house: address.house,
    block: address.block || '',
    apartment: address.apartment,
    entrance: address.entrance,
    floor: address.floor,
    has_intercom: address.has_intercom,
  } as AddressForm;

  const saving = ref<boolean>(false);
  const form = ref<AddressForm>(addressFields);

  const save = async (): Promise<boolean> => {
    if (saving.value) {
      return false;
    }

    const { errors, data } = useAddressFormValue(form.value, address.resolver, address);

    if (errors.length > 0) {
      useNotification('error', 'Ошибка', errors[0]);

      return false;
    }

    saving.value = true;

    try {
      await updateAddress(address.id, {
        delivery_address: {
          ...data,
          name: form.value.name,
        },
      });

      useNotification('success', 'Адрес сохранён', 'Адрес был успешно сохранён!');

      return true;
    } catch (e) {
      useNotification('error', 'Ошибка', getApiErrorMessage(e, 'Не удалось сохранить адрес. Повторите попытку.'));
    } finally {
      saving.value = false;
    }

    return false;
  };

  return {
    form,
    saving,
    save,
  };
}

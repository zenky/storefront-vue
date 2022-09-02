import { getApiErrorHandler, OptionalApiErrorHandler } from '../../errors.js';
import { PaginatedLoader, usePaginatedLoader } from '../../loaders.js';
import { Address, deleteAddress, getApiError, getCustomerAddresses, updateAddress } from '@zenky/api';
import { DataDestroyer, useDataDestroyer } from '../../destroyers.js';
import { AddressResult, AddressResultReason, AddressResultType, EditAddressFormProvider } from '../types.js';
import { AddressForm, getExistedAddressDisplayValue, useAddressFormValue } from '../../addresses/index.js';
import { ref } from 'vue';

export function useDeliveryAddressesList(errorHandler?: OptionalApiErrorHandler): PaginatedLoader<Address> {
  return usePaginatedLoader<Address>(
    getCustomerAddresses,
    getApiErrorHandler(errorHandler, 'useDeliveryAddressesList', 'Unable to load delivery addresses list.'),
  );
}

export function useDeliveryAddressDestroyer(errorHandler?: OptionalApiErrorHandler): DataDestroyer {
  return useDataDestroyer(
    deleteAddress,
    getApiErrorHandler(errorHandler, 'useDeliveryAddressDestroyer', 'Unable to delete delivery address.'),
  );
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

  const save = async (): Promise<AddressResult> => {
    if (saving.value) {
      return {
        type: AddressResultType.Failed,
        reason: AddressResultReason.InProgress,
      };
    }

    const { errors, data } = useAddressFormValue(form.value, address.resolver, address);

    if (errors.length > 0) {
      return {
        type: AddressResultType.Failed,
        reason: AddressResultReason.Validation,
        data: errors,
      };
    }

    saving.value = true;

    try {
      await updateAddress(address.id, {
        delivery_address: {
          ...data,
          name: form.value.name,
        },
      });

      return {
        type: AddressResultType.Completed,
      };
    } catch (e) {
      return {
        type: AddressResultType.Failed,
        reason: AddressResultReason.ApiError,
        error: getApiError(e),
      };
    } finally {
      saving.value = false;
    }
  };

  return {
    form,
    saving,
    save,
  };
}

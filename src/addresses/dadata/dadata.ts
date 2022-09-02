import { Address, City, getAddressSuggestions } from '@zenky/api';
import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { getCityPart, getDaDataEntityName, getHousePart } from './helpers.js';
import { debounce } from 'lodash-es';
import { useStoreStore } from '../../store/index.js';
import { storeToRefs } from 'pinia';

export interface DadataProvider {
  query: Ref<string | null>;
  loading: Ref<boolean>;
  results: Ref<any[]>;
}

export function useDadata(): DadataProvider {
  const { cityId } = storeToRefs(useStoreStore());
  const query = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const results = ref<any[]>([]);

  watch(query, debounce(async () => {
    if (loading.value || !query.value || !cityId.value) {
      return;
    }

    try {
      loading.value = true;

      const { suggestions } = await getAddressSuggestions({
        query: query.value,
        city_id: cityId.value,
      });

      results.value = suggestions;
    } catch (e) {
      //
    } finally {
      loading.value = false;
    }
  }, 500));

  return {
    query,
    loading,
    results,
  };
}

export function useSuggestionsRestrictedToCity(city?: City): { restricted: ComputedRef<boolean> } {
  const restricted = computed(() => {
    if (!city) {
      return false;
    } else if (!city.settings) {
      return false;
    }

    return city.settings.addresses.restrict_suggestions
      && city.settings.addresses.search_radius === null;
  });

  return {
    restricted,
  };
}

export function getSelectedAddress(suggestion: any, house: string, block?: string | null): string | null {
  const city = getCityPart(suggestion);
  const street = suggestion[`${getDaDataEntityName(suggestion, ['street', 'settlement', 'city_district'])}_with_type`];

  if (!city || !street) {
    return null;
  }

  let address;

  if (city !== street) {
    address = `${city}, ${street}, ${getHousePart(house)}`;
  } else {
    address = `${city}, ${getHousePart(house)}`;
  }

  if (block) {
    address += ` ${block}`;
  }

  return address;
}

export function getSelectedAddressDisplayValue(suggestion: any): { short: string | null, full: string | null } {
  const entityName = getDaDataEntityName(suggestion, ['street', 'settlement', 'city_district']);

  if (entityName === null) {
    throw new Error('Selected address does not have a single field that we qualify as "street"');
  }

  const entityWithType = suggestion[`${entityName}_with_type`];
  const cityEntityName = getDaDataEntityName(suggestion, ['city', 'settlement']);
  const cityEntityWithType = suggestion[`${cityEntityName}_with_type`];

  return {
    short: entityWithType,
    full: cityEntityWithType === entityWithType ? cityEntityWithType : `${cityEntityWithType}, ${entityWithType}`,
  };
}

export function getExistedAddressDisplayValue(address: Address, restrictedToCity: boolean): string {
  const query = [];

  if (address.city && !restrictedToCity) {
    query.push(address.city.full);
  }

  if (address.settlement && query.indexOf(address.settlement) === -1) {
    query.push(address.settlement);
  }

  if (address.street && query.indexOf(address.street.full) === -1) {
    query.push(address.street.full);
  }

  return query.join(', ');
}

export function getExistedAddress(address: Address, house?: string | null, block?: string | null): string {
  const pieces = getExistedAddressDisplayValue(address, false).split(',');

  if (house) {
    pieces.push(`д ${house}`);
  }

  if (block) {
    pieces.push(Number.isNaN(parseInt(block, 10)) ? block : `к ${block}`);
  }

  return pieces.join(', ');
}

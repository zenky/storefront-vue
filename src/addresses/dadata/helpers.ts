export function getDaDataEntityName(data: any, types: string[]): string | null | undefined {
  return types.find((type: string) => data[type] !== 'undefined' && data[type]);
}

export function getHousePart(house: string): string {
  if (Number.isNaN(parseInt(house, 10))) {
    return `${house}`;
  }

  return `д ${house}`;
}

export function getSettlementPart(suggestion: any): string | null {
  const city: string | null | undefined = suggestion.city_with_type;
  const area: string | null | undefined = suggestion.area_with_type;
  const region: string | null | undefined = suggestion.region_with_type;

  if (city) {
    return city === suggestion.settlement_with_type
      ? suggestion.settlement_with_type
      : `${city}, ${suggestion.settlement_with_type}`;
  } else if (region && area) {
    return `${region}, ${area}, ${suggestion.settlement_with_type}`;
  } else if (region) {
    return `${region}, ${suggestion.settlement_with_type}`;
  } else if (area) {
    return `${area}, ${suggestion.settlement_with_type}`;
  }

  return suggestion.settlement_with_type;
}

export function getCityPart(suggestion: any): string | null {
  if (suggestion.settlement_with_type) {
    return getSettlementPart(suggestion);
  } else if (suggestion.city_with_type) {
    return suggestion.city_with_type;
  }

  return null;
}

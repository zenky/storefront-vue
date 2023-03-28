export interface ZenkyStorage {
  prefix(value: string): ZenkyStorage;
  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): void;
  delete(key: string): void;
}

let prefix: string | null = null;
const getPrefixedKey = (key: string) => (prefix ? `${prefix}:${key}` : key);

const defaultStorage: ZenkyStorage = {
  prefix(value: string): ZenkyStorage {
    prefix = value;

    return this;
  },

  get(key: string, defaultValue?: any): any {
    const item = localStorage.getItem(getPrefixedKey(key));

    if (item === undefined || item === null) {
      return defaultValue;
    }

    return JSON.parse(item).value;
  },

  set(key: string, value: any): void {
    localStorage.setItem(getPrefixedKey(key), JSON.stringify({ value }));
  },

  delete(key: string): void {
    this.set(key, null);
  },
};

let storage: ZenkyStorage | null = null;

export function setStorage(customStorage: ZenkyStorage): void {
  storage = customStorage;
}

export function createStorage(storeId: string): ZenkyStorage {
  if (storage !== null) {
    return storage.prefix(`zenky:storefront:${storeId}`);
  }

  return defaultStorage.prefix(`zenky:storefront:${storeId}`);
}

export function getStorage(): ZenkyStorage {
  if (storage !== null) {
    return storage;
  }

  return defaultStorage;
}

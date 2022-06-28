let prefix: string | null = null;
const getPrefixedKey = (key: string) => (prefix ? `${prefix}:${key}` : key);

export interface ZenkyStorage {
  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): void;
  delete(key: string): void;
}

const storage: ZenkyStorage = {
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

export const createStorage = (storeId: string): ZenkyStorage => {
  prefix = `zenky:storefront:${storeId}`;

  return storage;
};

export const getStorage = (): ZenkyStorage => storage;

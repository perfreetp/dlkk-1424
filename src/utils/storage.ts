const STORAGE_PREFIX = 'iphone-repair-';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;
      const item = localStorage.getItem(fullKey);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Storage get error for key "${key}":`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch (error) {
      console.warn(`Storage set error for key "${key}":`, error);
    }
  },

  remove(key: string): void {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.warn(`Storage remove error for key "${key}":`, error);
    }
  },

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Storage clear error:', error);
    }
  },

  has(key: string): boolean {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      console.warn(`Storage has error for key "${key}":`, error);
      return false;
    }
  },
};

export const storageKeys = {
  SELECTION: 'selection',
  PINNED_MODELS: 'pinned-models',
  FAVORITE_MODELS: 'favorite-models',
  COMPARE_MODELS: 'compare-models',
  FAVORITE_NOTES: 'favorite-notes',
  HISTORY_QUOTES: 'history-quotes',
  WORK_ORDERS: 'work-orders',
  INVENTORY_RESERVATIONS: 'inventory-reservations',
  INVENTORY_ITEMS: 'inventory-items',
  THEME: 'theme',
} as const;

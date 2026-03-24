/**
 * UI Designer: Storage Utility
 * Забезпечує надійну взаємодію з браузерним сховищем
 */

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : defaultValue;
    } catch (error) {
      console.warn(`Storage error for key "${key}":`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save to storage for key "${key}":`, error);
    }
  },
};

import { useState, useEffect } from "react";
import { storage } from "../utils/storage";

/**
 * UI Designer: Persistence Hook
 * Кастомний хук для автоматичної синхронізації стану з localStorage
 */

export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Використання Lazy Initializer для уникнення зайвих звернень до диска
  const [value, setValue] = useState<T>(() => {
    return storage.get(key, defaultValue);
  });

  useEffect(() => {
    storage.set(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

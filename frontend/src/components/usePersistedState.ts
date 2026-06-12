import { useEffect, useState } from "react";

export function usePersistedState<T>(
  key: string,
  initial: T,
  migrate?: (raw: unknown) => T,
) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed: unknown = JSON.parse(raw);
      return migrate ? migrate(parsed) : (parsed as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage 容量超限或被禁用：静默忽略
    }
  }, [key, value]);

  return [value, setValue] as const;
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';

function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const debouncedSetItem = useMemo(
    () =>
      debounce((valueToStore: T) => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.error(error);
          }
        }
      }, 1000), // 1 second debounce delay
    [key]
  );

  useEffect(() => {
    debouncedSetItem(storedValue);
    return () => {
      debouncedSetItem.cancel();
    };
  }, [storedValue, debouncedSetItem]);
  
  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    setStoredValue(value);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);


  return [storedValue, setValue];
}

export default useLocalStorage;
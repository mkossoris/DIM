import useResizeObserver from '@react-hook/resize-observer';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { EventBus, Observable } from './observable';

/**
 * Subscribe to an EventBus. Use useCallback on the subscribeFn to prevent it
 * changing on every render.
 */
export function useEventBusListener<T>(
  eventBus: EventBus<T> | Observable<T>,
  subscribeFn: (value: T) => void
) {
  useEffect(() => eventBus.subscribe(subscribeFn), [eventBus, subscribeFn]);
}

/**
 * Returns whether the shift key is held down (ignores focus)
 */
export function useShiftHeld() {
  const [shiftHeld, setShiftHeld] = useState(false);
  useEffect(() => {
    const shiftTrue = (e) => {
      e.shiftKey && setShiftHeld(true);
    };
    const shiftFalse = (e) => {
      !e.shiftKey && setShiftHeld(false);
    };
    document.addEventListener('keydown', shiftTrue);
    document.addEventListener('keyup', shiftFalse);
    return () => {
      document.removeEventListener('keydown', shiftTrue);
      document.removeEventListener('keyup', shiftFalse);
    };
  }, []);

  return shiftHeld;
}

/**
 * Sets a CSS variable to the height of the passed in ref. We could probably use resize observers but
 * just doing it on re-render seems to work. Don't overuse this.
 */
export function useSetCSSVarToHeight(ref: React.RefObject<HTMLElement>, propertyName: string) {
  const updateVar = useCallback(
    (height) => {
      document.querySelector('html')!.style.setProperty(propertyName, height + 'px');
    },
    [propertyName]
  );
  useLayoutEffect(() => {
    updateVar(ref.current!.offsetHeight);
  }, [updateVar, ref]);
  useResizeObserver(ref, (entry) => updateVar((entry.target as HTMLElement).offsetHeight));
}

/**
 * Like useState, but saves to/from LocalStorage.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (val: T | ((initial: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(
    (): T => {
      try {
        // Get from local storage by key
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        return initialValue;
      }
    }
  );
  const setValue = (value: T) => {
    // Allow value to be a function so we have same API as useState
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };
  return [storedValue, setValue];
}

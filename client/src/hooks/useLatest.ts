import { useRef } from 'react';

/**
 * Returns a ref that always contains the latest value.
 * Updates synchronously during render - no useEffect needed.
 * Use this to avoid stale closures in callbacks.
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}


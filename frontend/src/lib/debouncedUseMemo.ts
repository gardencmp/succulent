import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from 'react';

export function useDebouncedMemo<T>(factory: () => T, deps: any[], ms: number) {
  const [current, setCurrent] = useState(() => factory());
  const debouncedSetState = useCallback(debounce(setCurrent, ms), []);
  useEffect(function () {
    debouncedSetState(() => factory());
  }, deps);
  return current;
}

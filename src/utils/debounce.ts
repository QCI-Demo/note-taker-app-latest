/**
 * Returns a debounced function that delays invoking `fn` until `delay` ms have elapsed
 * since the last call. Supports both arrow and regular functions (regular functions receive
 * the correct `this` from the debounced wrapper's call site).
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number,
): DebouncedFunction<TArgs> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  function debounced(this: unknown, ...args: TArgs) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      fn.apply(this, args);
    }, delay);
  }

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debounced;
}

export type DebouncedFunction<TArgs extends unknown[]> = ((
  this: unknown,
  ...args: TArgs
) => void) & { cancel: () => void };

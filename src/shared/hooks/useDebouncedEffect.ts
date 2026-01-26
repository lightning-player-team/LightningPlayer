import { useEffect } from "react";

export interface IDebouncedEffectCallbackParams {
  cancelled: boolean;
}

/**
 * Like useEffect, but debounces the effect execution.
 *
 * The effect is delayed by `delay` ms. If dependencies change before the delay
 * elapses, the previous effect is cancelled and a new delay starts.
 *
 * @param callback - Effect callback should be a memoized function. The callback
 * should always read the cancelled state from the parameter to get the latest value.
 * @param delay - Debounce delay in milliseconds.
 */
export const useDebouncedEffect = (
  callback: (state: IDebouncedEffectCallbackParams) => void,
  delay: number,
): void => {
  useEffect(() => {
    const state = {
      cancelled: false,
    };
    const timeoutId = setTimeout(() => callback(state), delay);

    return () => {
      state.cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [callback, delay]);
};

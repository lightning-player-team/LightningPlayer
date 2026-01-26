import { RefObject, useEffect, useState } from "react";
import { IDimensions } from "../types/dimensions";
import { debounce } from "../utils/debounce";

/**
 *
 * @param ref to the HTML element to observe.
 * @returns dimensions of the element's contentBoxSize or undefined.
 */
export const useDimensions = <T extends HTMLElement>(
  ref: RefObject<T | null>,
) => {
  const [dimensions, setDimensions] = useState<IDimensions | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          const contentBoxSize = entry.contentBoxSize[0];
          if (contentBoxSize) {
            setDimensions({
              height: contentBoxSize.blockSize,
              width: contentBoxSize.inlineSize,
            });
          }
        }
      }, 100),
    );

    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return dimensions;
};

import { RefObject, useEffect, useState } from "react";
import { debounce } from "../utils/debounce";

interface Dimensions {
  width: number;
  height: number;
}

export const useDimensions = <T extends HTMLElement>(
  ref: RefObject<T | null>
) => {
  const [dimensions, setDimensions] = useState<Dimensions | undefined>(
    undefined
  );

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(
      debounce(() => {
        if (ref.current) {
          setDimensions({
            width: ref.current.offsetWidth,
            height: ref.current.offsetHeight,
          });
        }
      }, 100)
    );

    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return dimensions;
};

import { Ref } from "react";

export const passMultipleRefs = <T extends HTMLElement>(
  refs: (Ref<T> | undefined)[],
) => {
  return (element: T | null) => {
    refs.forEach((ref) => {
      if (ref) {
        if (typeof ref === "function") {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      }
    });
  };
};

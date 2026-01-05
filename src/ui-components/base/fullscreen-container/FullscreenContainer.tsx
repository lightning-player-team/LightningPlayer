import { useAtomValue } from "jotai";
import { forwardRef, ReactNode } from "react";
import { titleBarPinnedState } from "../../../shared/atoms/titleBarPinnedState";
import { fullscreenContainerStyles } from "./FullscreenContainer.styles";

interface FullscreenContainerProps {
  children?: ReactNode;
  className?: string;
}

/**
 * A fullscreen container that accounts for the pinned state of the TitleBar.
 */
export const FullscreenContainer = forwardRef<
  HTMLDivElement,
  FullscreenContainerProps
>(({ children, className }, ref) => {
  const isTitleBarPinned = useAtomValue(titleBarPinnedState);
  return (
    <div
      ref={ref}
      className={className}
      css={fullscreenContainerStyles}
      data-is-title-bar-pinned={isTitleBarPinned}
    >
      {children}
    </div>
  );
});

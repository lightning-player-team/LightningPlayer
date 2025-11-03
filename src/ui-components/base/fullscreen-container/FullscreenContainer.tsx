import { useAtomValue } from "jotai";
import { FC } from "react";
import { titleBarPinnedState } from "../../../shared/atoms/titleBarPinnedState";
import { fullscreenContainerStyles } from "./FullscreenContainer.styles";

/**
 * A fullscreen container that accounts for the pinned state of the TitleBar.
 */
export const FullscreenContainer: FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const isTitleBarPinned = useAtomValue(titleBarPinnedState);
  return (
    <div
      className={className}
      css={fullscreenContainerStyles}
      data-is-title-bar-pinned={isTitleBarPinned}
    >
      {children}
    </div>
  );
};

import { useAtomValue } from "jotai";
import { FC } from "react";
import { titleBarPinnedState } from "../../shared/settings/titleBarPinnedState";
import { containerStyles } from "./FullscreenContainer.styles";

export const FullscreenContainer: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isTitleBarPinned = useAtomValue(titleBarPinnedState);
  return (
    <div css={containerStyles} data-is-title-bar-pinned={isTitleBarPinned}>
      {children}
    </div>
  );
};

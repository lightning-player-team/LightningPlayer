import { FC, useState } from "react";
import { InfoIcon } from "../../../assets/svgs/InfoIcon";
import { ResizableWindow } from "../../base/resizable-window/ResizableWindow";
import {
  bottomControlsContainerStyles,
  infoButtonStyles,
  infoWindowStyles,
  playerControlOverlayContainerStyles,
} from "./PlayerControlOverlay.styles";

export const PlayerControlOverlay: FC = () => {
  const [isVideoInfoWindowOpen, setIsVideoInfoWindowOpen] = useState(false);

  const handleOnClickInfoButton = () => {
    setIsVideoInfoWindowOpen(!isVideoInfoWindowOpen);
  };

  const handleOnClickInfoWindowClose = () => {
    setIsVideoInfoWindowOpen(false);
  };

  return (
    <div css={playerControlOverlayContainerStyles}>
      <div css={bottomControlsContainerStyles}>
        <button
          aria-label="Video Info"
          css={infoButtonStyles}
          onClick={handleOnClickInfoButton}
        >
          <InfoIcon />
        </button>
      </div>
      {isVideoInfoWindowOpen && (
        <ResizableWindow
          css={infoWindowStyles}
          onClose={handleOnClickInfoWindowClose}
          title={"Media Info"}
        ></ResizableWindow>
      )}
    </div>
  );
};

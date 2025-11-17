import { FC, useState } from "react";
import { InfoIcon } from "../../../assets/svgs/InfoIcon";
import { IMediaInfo } from "../../../shared/types/mediaInfo";
import { ResizableWindow } from "../../base/resizable-window/ResizableWindow";
import {
  bottomControlsContainerStyles,
  infoButtonStyles,
  infoWindowStyles,
  playerControlOverlayContainerStyles,
  videoInfoPreStyles,
} from "./PlayerControlOverlay.styles";

export interface IPlayerControlOverlayProps {
  mediaInfo?: IMediaInfo;
}

export const PlayerControlOverlay: FC<IPlayerControlOverlayProps> = ({
  mediaInfo,
}) => {
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
        >
          <pre css={videoInfoPreStyles}>
            {JSON.stringify(mediaInfo, null, 2)}
          </pre>
        </ResizableWindow>
      )}
    </div>
  );
};

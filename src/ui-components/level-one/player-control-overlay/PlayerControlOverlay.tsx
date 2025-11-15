import { Command } from "@tauri-apps/plugin-shell";
import { FC, useEffect, useState } from "react";
import { InfoIcon } from "../../../assets/svgs/InfoIcon";
import { ResizableWindow } from "../../base/resizable-window/ResizableWindow";
import {
  bottomControlsContainerStyles,
  infoButtonStyles,
  infoWindowStyles,
  playerControlOverlayContainerStyles,
  videoInfoPreStyles,
} from "./PlayerControlOverlay.styles";

export interface IPlayerControlOverlayProps {
  filePath?: string;
}

export const PlayerControlOverlay: FC<IPlayerControlOverlayProps> = ({
  filePath,
}) => {
  const [isVideoInfoWindowOpen, setIsVideoInfoWindowOpen] = useState(false);
  const [videoInfo, setVideoInfo] = useState<string | undefined>(undefined);

  useEffect(() => {
    let unmounted = false;
    const fetchVideoInfo = async (filePath: string) => {
      const result = await Command.sidecar("binaries/ffprobe", [
        filePath,
        ..."-v quiet -print_format json -show_streams -show_format".split(" "),
      ]).execute();
      if (!unmounted) {
        setVideoInfo(result.stdout);
      }
    };
    if (filePath) {
      fetchVideoInfo(filePath);
    }
    return () => {
      unmounted = true;
    };
  }, [filePath]);

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
          title={"Video Info"}
        >
          <pre css={videoInfoPreStyles}>{videoInfo}</pre>
        </ResizableWindow>
      )}
    </div>
  );
};

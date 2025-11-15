import { convertFileSrc } from "@tauri-apps/api/core";
import { FC } from "react";
import { useLocation } from "react-router";
import { FullscreenContainer } from "../ui-components/base/fullscreen-container/FullscreenContainer";
import { PlayerControlOverlay } from "../ui-components/level-one/player-control-overlay/PlayerControlOverlay";
import { videoStyles } from "./Player.styles";

export const Player: FC = () => {
  const { state } = useLocation();
  const files = state.files as string[];
  const defaultCurrentFilePath = files[0];

  return (
    <FullscreenContainer>
      <video css={videoStyles}>
        <source src={convertFileSrc(defaultCurrentFilePath)} type="video/mp4" />
      </video>
      <PlayerControlOverlay filePath={defaultCurrentFilePath} />
    </FullscreenContainer>
  );
};

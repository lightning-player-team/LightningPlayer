import { convertFileSrc } from "@tauri-apps/api/core";
import { FC } from "react";
import { useLocation } from "react-router";
import { FullscreenContainer } from "../ui-components/base/fullscreen-container/FullscreenContainer";
import { videoStyles } from "./Player.styles";

export const Player: FC = () => {
  const { state } = useLocation();
  const files = state.files as string[];
  const defaultCurrentFilePath = files[0]
    ? convertFileSrc(files[0])
    : undefined;

  return (
    <FullscreenContainer>
      <video controls css={videoStyles}>
        <source src={defaultCurrentFilePath} type="video/mp4" />
      </video>
    </FullscreenContainer>
  );
};

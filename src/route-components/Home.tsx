import { open } from "@tauri-apps/plugin-dialog";
import { FC } from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui-components/base/button/Button";
import { FullscreenContainer } from "../ui-components/base/fullscreen-container/FullscreenContainer";
import {
  buttonStyles,
  contentContainerStyles,
  dragAndDropTextStyles,
  orTextStyles,
} from "./Home.styles";
import { ROUTES } from "./routes";

export const Home: FC = () => {
  const navigate = useNavigate();
  const handleOnClickOpenFile = async () => {
    const paths = await open({
      directory: false,
      multiple: true,
      filters: [
        { name: "All supported files", extensions: ["mp3", "mp4"] },
        { name: "Supported audio files", extensions: ["mp3"] },
        { name: "Supported video files", extensions: ["mp4"] },
      ],
    });
    if (paths && paths.length) {
      console.log("Selected file:", paths);
      navigate(ROUTES.player, { state: { files: paths } });
    } else {
      console.error("No files selected.");
    }
  };

  const handleOnClickOpenFolder = async () => {
    const path = await open({
      directory: true,
    });
    if (path) {
      console.log("Selected folder:", path);
    } else {
      console.error("No folder selected.");
    }
  };

  return (
    <FullscreenContainer>
      <div css={contentContainerStyles}>
        <Button css={buttonStyles} onClick={handleOnClickOpenFile}>
          Open File(s)
        </Button>
        <Button css={buttonStyles} onClick={handleOnClickOpenFolder}>
          Open Folder
        </Button>
        <p css={orTextStyles}>or</p>
        <p css={dragAndDropTextStyles}>Drag and drop here</p>
      </div>
    </FullscreenContainer>
  );
};

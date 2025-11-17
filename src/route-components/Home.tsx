import { open } from "@tauri-apps/plugin-dialog";
import { FC } from "react";
import { useNavigate } from "react-router";
import {
  AudioFileExtension,
  VideoFileExtension,
} from "../shared/types/fileExtensions";
import { Button } from "../ui-components/base/button/Button";
import { FullscreenContainer } from "../ui-components/base/fullscreen-container/FullscreenContainer";
import {
  buttonStyles,
  contentContainerStyles,
  dragAndDropTextStyles,
  orTextStyles,
} from "./Home.styles";
import { ROUTES } from "./routes";

const supportedVideoExtensions = Object.values(VideoFileExtension);
const supportedAudioExtensions = Object.values(AudioFileExtension);
const allSupportedExtensions = [
  ...supportedVideoExtensions,
  ...supportedAudioExtensions,
];

export const Home: FC = () => {
  const navigate = useNavigate();
  const handleOnClickOpenFile = async () => {
    const paths = await open({
      directory: false,
      multiple: true,
      filters: [
        {
          name: "All supported files",
          extensions: allSupportedExtensions,
        },
        { name: "Supported audio files", extensions: supportedAudioExtensions },
        { name: "Supported video files", extensions: supportedVideoExtensions },
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

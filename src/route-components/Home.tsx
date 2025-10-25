import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FC } from "react";
import { Button } from "../ui-components/base/button/Button";
import { FullscreenContainer } from "../ui-components/base/fullscreen-container/FullscreenContainer";
import {
  buttonStyles,
  contentContainerStyles,
  dragAndDropTextStyles,
  orTextStyles,
} from "./Home.styles";

export const Home: FC = () => {
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
    if (paths) {
      console.log("Selected file:", paths);
      try {
        const res = await invoke("process_paths", {
          paths: paths,
        });
        console.log("Processed files", res);
      } catch (error) {
        // Unexpected error
        console.log(error);
      }
    }
  };

  const handleOnClickOpenFolder = async () => {
    const path = await open({
      directory: true,
    });
    if (path) {
      console.log("Selected folder:", path);
      try {
        const res = await invoke("process_paths", {
          paths: [path],
        });
        console.log("Processed files", res);
      } catch (error) {
        // Unexpected error
        console.log(error);
      }
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

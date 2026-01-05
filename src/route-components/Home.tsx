import { open } from "@tauri-apps/plugin-dialog";
import { FC, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui-components/base/button/Button";
import { FullscreenContainer } from "../ui-components/base/fullscreen-container/FullscreenContainer";
import {
  buttonStyles,
  contentContainerStyles,
  dragAndDropTextStyles,
  hiddenInputStyles,
  orTextStyles,
} from "./Home.styles";
import { ROUTES } from "./routes";

export const Home: FC = () => {
  const openFileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // TODO: - remove tauri fs, dialog?
  // TODO: - redo drag and drop
  const handleOnClickOpenFile = async () => {
    openFileInputRef.current?.click();
  };
  const handleOnChangeFileInput: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Selected files:", files);
      navigate(ROUTES.player, { state: { files } });
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
        <input
          accept="audio/*,video/*"
          css={hiddenInputStyles}
          onChange={handleOnChangeFileInput}
          multiple
          ref={openFileInputRef}
          type="file"
        />
        <Button css={buttonStyles} onClick={handleOnClickOpenFolder}>
          Open Folder
        </Button>
        <p css={orTextStyles}>or</p>
        <p css={dragAndDropTextStyles}>Drag and drop here</p>
      </div>
    </FullscreenContainer>
  );
};

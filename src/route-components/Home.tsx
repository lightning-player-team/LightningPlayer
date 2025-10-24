import { FC } from "react";
import { Button } from "../ui-components/button/Button";
import { FullscreenContainer } from "../ui-components/fullscreen-container/FullscreenContainer";
import {
  contentContainerStyles,
  dragAndDropTextStyles,
  openFileButtonStyles,
  orTextStyles,
} from "./Home.styles";

export const Home: FC = () => {
  return (
    <FullscreenContainer>
      <div css={contentContainerStyles}>
        <Button css={openFileButtonStyles}>Open File</Button>
        <p css={orTextStyles}>or</p>
        <p css={dragAndDropTextStyles}>Drag and drop a file here</p>
      </div>
    </FullscreenContainer>
  );
};

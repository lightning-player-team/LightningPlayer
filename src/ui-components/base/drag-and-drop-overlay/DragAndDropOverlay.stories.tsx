import { Meta, StoryObj } from "@storybook/react-vite";
import { TauriEvent } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { FC, useEffect } from "react";
import { IStory, Theme } from "../../../shared/storybook/types";
import { renderWithThemeAndGlobalStyles } from "../../../shared/storybook/utils";
import {
  DragAndDropOverlay,
  IDragAndDropOverlayProps,
} from "./DragAndDropOverlay";

type DragAndDropOverlayStoryProps = IDragAndDropOverlayProps & IStory;

const TestDragAndDropWithEventOverride: FC<DragAndDropOverlayStoryProps> = ({
  theme,
  ...props
}) => {
  useEffect(() => {
    const appWindow = getCurrentWindow();
    appWindow.emit(TauriEvent.DRAG_ENTER, {});
  }, []);

  return renderWithThemeAndGlobalStyles(
    theme,
    <DragAndDropOverlay {...props} />
  );
};

type DragAndDropOverlayStory = StoryObj<DragAndDropOverlayStoryProps>;
const meta: Meta<DragAndDropOverlayStoryProps> = {
  title: "base/DragAndDropOverlay",
  component: DragAndDropOverlay,
};
export default meta;

export const Default: DragAndDropOverlayStory = {
  args: {
    theme: Theme.DarkDefault,
  },
  argTypes: {
    theme: {
      options: Object.values(Theme),
      control: { type: "select" },
    },
    testInvokeFail: { control: false },
  },
  render: ({ theme, ...args }) => {
    return renderWithThemeAndGlobalStyles(
      theme,
      <DragAndDropOverlay {...args} />
    );
  },
};

export const ProcessingFiles: DragAndDropOverlayStory = {
  ...Default,
  render: (args) => {
    return <TestDragAndDropWithEventOverride {...args} />;
  },
};

export const FileNotSupported: DragAndDropOverlayStory = {
  ...ProcessingFiles,
  args: {
    theme: Theme.DarkDefault,
    testInvokeFail: true,
  },
};

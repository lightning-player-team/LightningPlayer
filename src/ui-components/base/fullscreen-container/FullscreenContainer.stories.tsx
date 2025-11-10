import { Meta, StoryObj } from "@storybook/react-vite";
import { IStory, Theme } from "../../../shared/storybook/types";
import { renderWithThemeAndGlobalStyles } from "../../../shared/storybook/utils";
import {
  FullscreenContainer,
  IFullscreenContainerProps,
} from "./FullscreenContainer";

const meta = {
  title: "base/FullscreenContainer",
  component: FullscreenContainer,
  render: ({ theme }) => {
    return renderWithThemeAndGlobalStyles(theme, <FullscreenContainer />);
  },
} satisfies Meta<IStory & IFullscreenContainerProps>;

export default meta;
type FullscreenContainerStory = StoryObj<typeof meta>;

export const Default: FullscreenContainerStory = {
  args: {
    theme: Theme.DarkDefault,
  },
  argTypes: {
    theme: {
      options: Object.values(Theme),
      control: { type: "select" },
    },
  },
};

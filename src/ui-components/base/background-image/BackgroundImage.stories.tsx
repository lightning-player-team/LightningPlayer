import type { Meta, StoryObj } from "@storybook/react-vite";
import { IStory, Theme } from "../../../shared/storybook/types";
import { renderWithThemeAndGlobalStyles } from "../../../shared/storybook/utils";
import { BackgroundImage } from "./BackgroundImage";

const meta = {
  title: "base/BackgroundImage",
  component: BackgroundImage,
  render: ({ theme }) => {
    return renderWithThemeAndGlobalStyles(theme, <BackgroundImage />);
  },
} satisfies Meta<IStory>;

export default meta;
type BackgroundImageStory = StoryObj<typeof meta>;

export const Default: BackgroundImageStory = {
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

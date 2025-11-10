import { Meta, StoryObj } from "@storybook/react-vite";
import { IStory, Theme } from "../../../shared/storybook/types";
import { renderWithThemeAndGlobalStyles } from "../../../shared/storybook/utils";
import { TitleBar } from "./TitleBar";

const meta = {
  title: "base/TitleBar",
  component: TitleBar,
  render: ({ theme }) => {
    return renderWithThemeAndGlobalStyles(theme, <TitleBar />);
  },
} satisfies Meta<IStory>;

export default meta;
type TitleBarStory = StoryObj<typeof meta>;

export const Default: TitleBarStory = {
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

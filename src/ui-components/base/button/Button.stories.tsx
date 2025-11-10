import { Meta, StoryObj } from "@storybook/react-vite";
import { IStory, Theme } from "../../../shared/storybook/types";
import { renderWithThemeAndGlobalStyles } from "../../../shared/storybook/utils.tsx";
import { Button } from "./Button";
import { ButtonVariant, IButtonProps } from "./Button.types";

const meta = {
  title: "base/Button",
  component: Button,
  render: ({ theme }) => {
    return renderWithThemeAndGlobalStyles(theme, <Button>Button</Button>);
  },
} satisfies Meta<IStory & IButtonProps>;

export default meta;
type ButtonStory = StoryObj<typeof meta>;

export const Default: ButtonStory = {
  args: {
    variant: ButtonVariant.Text,
    theme: Theme.DarkDefault,
  },
  argTypes: {
    variant: {
      options: Object.values(ButtonVariant),
      control: { type: "select" },
    },
    theme: {
      options: Object.values(Theme),
      control: { type: "select" },
    },
  },
};

import { useTheme } from "@emotion/react";
import { backgroundImageStyles } from "./BackgroundImage.styles";
import { FC } from "react";

export const BackgroundImage: FC = () => {
  const theme = useTheme();
  return (
    <div
      css={[
        backgroundImageStyles,
        { backgroundColor: theme.colors.home.background },
      ]}
    />
  );
};

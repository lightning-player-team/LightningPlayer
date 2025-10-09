import { useTheme } from "@emotion/react";
import { backgroundImageStyles } from "./BackgroundImage.styles";

export const BackgroundImage = () => {
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

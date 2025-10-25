import { useTheme } from "@emotion/react";
import { FC } from "react";
import { backgroundImageStyles } from "./BackgroundImage.styles";

export const BackgroundImage: FC = () => {
  const theme = useTheme();
  return (
    <div
      css={[
        backgroundImageStyles,
        { backgroundColor: theme.colors.root.background },
      ]}
    />
  );
};

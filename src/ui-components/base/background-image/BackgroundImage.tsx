import { useTheme } from "@emotion/react";
import { FC } from "react";
import { backgroundImageStyles } from "./BackgroundImage.styles";

/**
 * The background image component is a full screen image that has fixed
 * position and should be rendered under all other layers.
 */
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

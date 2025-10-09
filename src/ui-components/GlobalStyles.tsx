import { css, Global, useTheme } from "@emotion/react";

export const GlobalStyles = () => {
  const theme = useTheme();
  const globalStyles = css({
    body: {
      fontFamily: '"Roboto","Arial",sans-serif',
      color: theme.colors.text.default,
      a: {
        color: theme.colors.text.link,
      },
    },
  });
  return <Global styles={globalStyles} />;
};

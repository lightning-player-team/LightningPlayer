import { css, Global, useTheme } from "@emotion/react";

export const GlobalStyles = () => {
  const theme = useTheme();
  const globalStyles = css({
    body: {
      color: theme.colors.text.default,
      fontFamily: '"Roboto","Arial",sans-serif',
      margin: 0,
      a: {
        color: theme.colors.text.link,
      },
    },
  });
  return <Global styles={globalStyles} />;
};

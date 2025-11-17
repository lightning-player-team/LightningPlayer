import { css, Global, useTheme } from "@emotion/react";

export const GlobalStyles = () => {
  const theme = useTheme();
  const globalStyles = css({
    body: {
      a: {
        color: theme.colors.text.link,
      },
      color: theme.colors.text.default,
      fontFamily: '"Roboto","Arial",sans-serif',
      margin: 0,
      overflow: "hidden",
      scrollbarColor: `${theme.colors.scrollbar.thumb} ${theme.colors.scrollbar.track}`,
    },
  });
  return <Global styles={globalStyles} />;
};

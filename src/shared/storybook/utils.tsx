import { ThemeProvider } from "@emotion/react";
import { JSX } from "react";
import { themeDarkDefault } from "../../themes";
import { GlobalStyles } from "../styles/GlobalStyles";
import { Theme } from "./types";

const themeMap = {
  [Theme.DarkDefault]: themeDarkDefault,
};

export const renderWithThemeAndGlobalStyles = (
  theme: Theme,
  component: JSX.Element
) => {
  const selectedTheme = themeMap[theme];
  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
      {component}
    </ThemeProvider>
  );
};

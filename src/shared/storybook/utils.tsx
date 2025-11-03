import { ThemeProvider } from "@emotion/react";
import { JSX } from "react";
import { themeDarkDefault } from "../../themes";
import { Theme } from "./types";

const themeMap = {
  [Theme.DarkDefault]: themeDarkDefault,
};

export const renderWithTheme = (theme: Theme, component: JSX.Element) => {
  const selectedTheme = themeMap[theme];
  return <ThemeProvider theme={selectedTheme}>{component}</ThemeProvider>;
};

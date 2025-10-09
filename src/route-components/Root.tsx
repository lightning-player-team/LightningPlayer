import { ThemeProvider } from "@emotion/react";
import { Outlet } from "react-router";
import { themeDarkDefault } from "../themes";
import { BackgroundImage } from "../ui-components/BackgroundImage";
import { GlobalStyles } from "../ui-components/GlobalStyles";

export const Root = () => {
  return (
    <main>
      <ThemeProvider theme={themeDarkDefault}>
        <GlobalStyles />
        <BackgroundImage />
        <Outlet />
      </ThemeProvider>
    </main>
  );
};

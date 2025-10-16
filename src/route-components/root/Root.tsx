import { ThemeProvider } from "@emotion/react";
import { Outlet } from "react-router";
import { themeDarkDefault } from "../../themes";
import { GlobalStyles } from "../../ui-components/GlobalStyles";
import { BackgroundImage } from "../../ui-components/background-image/BackgroundImage";
import { TitleBar } from "../../ui-components/title-bar/TitleBar";
import { FC } from "react";

export const Root: FC = () => {
  return (
    <main>
      <ThemeProvider theme={themeDarkDefault}>
        <GlobalStyles />
        <BackgroundImage />
        <TitleBar />
        <Outlet />
      </ThemeProvider>
    </main>
  );
};

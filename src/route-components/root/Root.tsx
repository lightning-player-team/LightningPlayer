import { ThemeProvider } from "@emotion/react";
import { FC } from "react";
import { Outlet } from "react-router";
import { GlobalStyles } from "../../shared/styles/GlobalStyles";
import { themeDarkDefault } from "../../themes";
import { BackgroundImage } from "../../ui-components/base/background-image/BackgroundImage";
import { DragAndDropOverlay } from "../../ui-components/base/drag-and-drop-overlay/DragAndDropOverlay";
import { TitleBar } from "../../ui-components/base/title-bar/TitleBar";

export const Root: FC = () => {
  return (
    <main>
      <ThemeProvider theme={themeDarkDefault}>
        <GlobalStyles />
        <BackgroundImage />
        <TitleBar />
        <DragAndDropOverlay />
        <Outlet />
      </ThemeProvider>
    </main>
  );
};

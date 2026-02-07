import { ThemeProvider } from "@emotion/react";
import { isTauri } from "@tauri-apps/api/core";
import { FC } from "react";
import { Outlet } from "react-router";
import { useWindowState } from "../../shared/hooks/useWindowStates";
import { GlobalStyles } from "../../shared/styles/GlobalStyles";
import { themeDarkDefault } from "../../themes";
import { BackgroundImage } from "../../ui-components/base/background-image/BackgroundImage";
import { DragAndDropOverlay } from "../../ui-components/base/drag-and-drop-overlay/DragAndDropOverlay";
import { TitleBar } from "../../ui-components/level-one/title-bar/TitleBar";

export const Root: FC = () => {
  useWindowState();

  return (
    <main>
      <ThemeProvider theme={themeDarkDefault}>
        <GlobalStyles />
        <BackgroundImage />
        {isTauri() && <TitleBar />}
        <DragAndDropOverlay />
        <Outlet />
      </ThemeProvider>
    </main>
  );
};

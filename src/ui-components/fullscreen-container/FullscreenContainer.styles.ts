import { css } from "@emotion/react";
import { TITLE_BAR_HEIGHT } from "../title-bar/TitleBar.tc";

export const containerStyles = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  justifyContent: "center",
  position: "relative",
  width: "100vw",

  '&[data-is-title-bar-pinned="true"]': {
    height: `calc(100vh - ${TITLE_BAR_HEIGHT}px)`,
    marginTop: TITLE_BAR_HEIGHT,
  },
});

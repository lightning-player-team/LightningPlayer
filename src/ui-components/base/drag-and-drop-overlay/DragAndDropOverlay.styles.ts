import { css } from "@emotion/react";
import { ZIndex } from "../../../shared/styles/zIndex";

export const dragAndDropOverlayContainerStyles = css({
  alignItems: "center",
  background: "transparent",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  justifyContent: "center",
  left: 0,
  position: "fixed",
  top: 0,
  width: "100vw",
  zIndex: ZIndex.DRAG_AND_DROP_OVERLAY,
  pointerEvents: "none",
  "&[data-drag-and-drop-active=true]": {
    background: "rgba(0, 0, 0, 0.9)",
    pointerEvents: "auto",
  },
});

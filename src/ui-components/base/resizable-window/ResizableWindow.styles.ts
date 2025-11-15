import { css, Theme } from "@emotion/react";

const resizeHandleSize = 8;
export const WINDOW_TITLE_BAR_HEIGHT = 28;
export const WINDOW_TITLE_BAR_CLASSNAME = "titlebar";

export const resizableWindowContainerStyles = (theme: Theme) =>
  css({
    height: 400,
    width: 300,
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    "&:focus [data-window-title-bar]": {
      backgroundColor: theme.colors.titleBar.activeBackground,
    },
  });

export const resizeRegionTopStyles = css({
  position: "absolute",
  top: 0,
  width: "100%",
  height: resizeHandleSize,
  cursor: "ns-resize",
});
export const resizeRegionBottomStyles = css({
  position: "absolute",
  bottom: 0,
  width: "100%",
  height: resizeHandleSize,
  cursor: "ns-resize",
});
export const resizeRegionLeftStyles = css({
  position: "absolute",
  left: 0,
  width: resizeHandleSize,
  height: "100%",
  cursor: "ew-resize",
});
export const resizeRegionRightStyles = css({
  position: "absolute",
  right: 0,
  width: resizeHandleSize,
  height: "100%",
  cursor: "ew-resize",
});

export const titleBarStyles = (theme: Theme) =>
  css({
    height: WINDOW_TITLE_BAR_HEIGHT,
    width: "100%",
    backgroundColor: theme.colors.titleBar.inactiveBackground,
    display: "grid",
    gridTemplateColumns: "auto max-content",
  });

export const contentContainerStyles = (theme: Theme) =>
  css({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.colors.window.background,
    overflow: "auto",
    padding: 8,
  });

export const titleDragContainerStyles = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "row",
  paddingLeft: 8,
  whiteSpace: "nowrap",
});

export const closeButtonStyles = (theme: Theme) =>
  css({
    alignItems: "center",
    appearance: "none",
    backgroundColor: "transparent",
    border: "none",
    color: theme.colors.titleBar.inactiveForeground,
    display: "inline-flex",
    fontSize: 16,
    height: WINDOW_TITLE_BAR_HEIGHT,
    justifyContent: "center",
    margin: 0,
    padding: 0,
    width: 48,
    "&:hover": {
      background: theme.colors.titleBar.hoverCloseBackground,
      color: theme.colors.titleBar.hoverCloseForeground,
    },
    "&:active": {
      background: theme.colors.titleBar.pressedCloseBackground,
    },
  });

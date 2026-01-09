import { css, Theme } from "@emotion/react";

const resizeHandleSize = 8;
export const WINDOW_TITLE_BAR_HEIGHT = 28;
export const WINDOW_TITLE_BAR_CLASSNAME = "titlebar";

export const resizableWindowContainerStyles = (theme: Theme) =>
  css({
    display: "flex",
    flexDirection: "column",
    height: 400,
    position: "absolute",
    width: 300,
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
    backgroundColor: theme.colors.titleBar.inactiveBackground,
    display: "grid",
    gridTemplateColumns: "auto max-content",
    height: WINDOW_TITLE_BAR_HEIGHT,
    width: "100%",
  });

export const contentContainerStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.window.background,
    display: "flex",
    flex: 1,
    flexDirection: "column",
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

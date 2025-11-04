import { css, Theme } from "@emotion/react";
import { ZIndex } from "../../../shared/styles/zIndex";
import { TITLE_BAR_HEIGHT } from "./TitleBar.types";

export const titleBarContainerStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.titleBar.inactiveBackground,
    display: "grid",
    gridTemplateColumns: "auto max-content",
    height: TITLE_BAR_HEIGHT,
    left: 0,
    opacity: 0,
    position: "fixed",
    right: 0,
    top: 0,
    transition: "opacity 0.2s ease-in-out",
    userSelect: "none",
    zIndex: ZIndex.TITLE_BAR,
    "&[data-is-hovered=true]": {
      opacity: 1,
    },
    "&[data-is-focused=true]": {
      backgroundColor: theme.colors.titleBar.activeBackground,
    },
  });

export const pinnedContainerStyles = css({
  opacity: 1,
});

export const windowControlsContainerStyles = (theme: Theme) =>
  css({
    button: {
      alignItems: "center",
      appearance: "none",
      backgroundColor: "transparent",
      border: "none",
      color: theme.colors.titleBar.inactiveForeground,
      display: "inline-flex",
      fontSize: 16,
      height: TITLE_BAR_HEIGHT,
      justifyContent: "center",
      margin: 0,
      padding: 0,
      width: 48,
      "&:hover": {
        background: theme.colors.titleBar.hoverBackground,
      },
      "&:active": {
        background: theme.colors.titleBar.pressedBackground,
      },

      "[data-is-focused=true] &": {
        color: theme.colors.titleBar.activeForeground,
      },

      "&[data-close-button]": {
        "&:hover": {
          background: theme.colors.titleBar.hoverCloseBackground,
          color: theme.colors.titleBar.hoverCloseForeground,
        },
        "&:active": {
          background: theme.colors.titleBar.pressedCloseBackground,
        },
      },
    },
  });

import { css, Theme } from "@emotion/react";

export const TITLE_BAR_HEIGHT = 30;

export const containerStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.titleBar.activeBackground,
    display: "grid",
    gridTemplateColumns: "auto max-content",
    height: TITLE_BAR_HEIGHT,
    left: 0,
    opacity: 0,
    position: "fixed",
    right: 0,
    top: 0,
    userSelect: "none",
    transition: "opacity 0.2s ease-in-out",
    "&[data-is-hovered=true]": {
      opacity: 1,
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
      color: theme.colors.titleBar.activeForeground,
      display: "inline-flex",
      fontSize: 16,
      height: TITLE_BAR_HEIGHT,
      justifyContent: "center",
      margin: 0,
      padding: 0,
      width: 48,
      ":hover": {
        background: theme.colors.titleBar.hoverBackground,
      },
      ":active": {
        background: theme.colors.titleBar.pressedBackground,
      },

      "&[data-close-button]": {
        svg: {
          path: {
            strokeWidth: 5,
          },
        },
        ":hover": {
          background: theme.colors.titleBar.hoverCloseBackground,
          color: theme.colors.titleBar.hoverCloseForeground,
        },
        ":active": {
          background: theme.colors.titleBar.pressedCloseBackground,
        },
      },
    },
  });

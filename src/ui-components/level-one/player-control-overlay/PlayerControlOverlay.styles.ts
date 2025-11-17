import { css, Theme } from "@emotion/react";

export const playerControlOverlayContainerStyles = css({
  background: "transparent",
  height: "100%",
  left: 0,
  position: "absolute",
  top: 0,
  width: "100%",
});

export const infoWindowStyles = css({
  top: 20,
  left: 20,
});

export const bottomControlsContainerStyles = css({
  alignItems: "center",
  bottom: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "row",
  height: 60,
  paddingLeft: 20,
  paddingRight: 20,
  position: "absolute",
  width: "100%",
});

export const infoButtonStyles = (theme: Theme) =>
  css({
    background: "transparent",
    bottom: "20px",
    color: theme.colors.playerControls.button.color,
    border: "none",
    height: 24,
    width: 24,
    padding: 0,
    fontSize: 24,
  });

export const videoInfoPreStyles = css({
  whiteSpace: "pre-wrap",
  overflowWrap: "break-word",
});

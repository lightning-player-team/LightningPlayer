import { css, Theme } from "@emotion/react";

const progressBarTrackHeight = 3;
const progressBarTrackExpandedHeight = 5;
export const progressBarThumbRadius = 6;
export const progressBarThumbExpandedRadius = 8;
const progressBarContainerHeight = progressBarThumbExpandedRadius * 2;

export const playerControlOverlayContainerStyles = (theme: Theme) =>
  css({
    background: "transparent",
    height: "100%",
    left: 0,
    opacity: 0,
    position: "absolute",
    top: 0,
    transition: `opacity ${theme.motion.playerControls.overlay.transitionDuration} ${
      theme.motion.playerControls.overlay.transitionTimingFunction
    }`,
    width: "100%",
    "&[data-is-hovered=true]": {
      opacity: 1,
    },
  });

export const bottomControlsContainerStyles = css({
  alignItems: "center",
  bottom: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  paddingLeft: 20,
  paddingRight: 20,
  position: "absolute",
  width: "100%",
});

export const progressBarContainerStyles = css({
  backgroundColor: "transparent",
  containerType: "size",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  height: progressBarContainerHeight,
  justifyContent: "center",
  overflow: "visible",
  position: "relative",
  width: "100%",
});

export const progressBarCurrentStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.progressBar.thumb,
    borderRadius: progressBarTrackHeight / 2,
    height: progressBarTrackHeight,
    position: "absolute",
    transition: `transform ${theme.motion.playerControls.progressBar.transitionDuration} ${theme.motion.playerControls.progressBar.transitionTimingFunction}`,

    "[data-is-progress-bar-hovered=true] &": {
      transform: `scaleY(${
        progressBarTrackExpandedHeight / progressBarTrackHeight
      })`,
    },
  });

export const progressbarThumbStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.progressBar.thumb,
    borderRadius: "50%",
    height: progressBarThumbRadius * 2,
    position: "absolute",
    transition: `transform ${theme.motion.playerControls.progressBar.transitionDuration} ${theme.motion.playerControls.progressBar.transitionTimingFunction}`,
    width: progressBarThumbRadius * 2,

    "[data-is-progress-bar-hovered=true] &": {
      transform: `scale(${
        progressBarThumbExpandedRadius / progressBarThumbRadius
      })`,
    },
  });

export const progressBarTrackStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.progressBar.background,
    borderRadius: progressBarTrackHeight / 2,
    height: progressBarTrackHeight,
    position: "absolute",
    transition: `transform ${theme.motion.playerControls.progressBar.transitionDuration} ${theme.motion.playerControls.progressBar.transitionTimingFunction}`,
    width: "100%",

    "[data-is-progress-bar-hovered=true] &": {
      transform: `scaleY(${
        progressBarTrackExpandedHeight / progressBarTrackHeight
      })`,
    },
  });

export const progressBarTrackFillStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.progressBar.hoverFill,
    borderRadius: progressBarTrackHeight / 2,
    height: progressBarTrackHeight,
    opacity: 0,
    position: "absolute",
    transition: `opacity ${theme.motion.playerControls.progressBar.transitionDuration} ${theme.motion.playerControls.progressBar.transitionTimingFunction}`,

    "[data-is-progress-bar-hovered=true] &": {
      opacity: 1,
    },
  });

export const buttonContainerStyles = css({
  alignItems: "center",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  marginTop: 8,
  marginBottom: 12,
  width: "100%",
});

export const leftContainerStyles = css({
  justifySelf: "start",
});

export const centerContainerStyles = css({});

export const rightContainerStyles = css({
  justifySelf: "end",
});

export const playButtonStyles = (theme: Theme) =>
  css({
    background: "transparent",
    border: "none",
    color: theme.colors.playerControls.button.color,
    cursor: "pointer",
    fontSize: 36,
    lineHeight: 0,
    padding: 0,
    transition: `color ${theme.motion.playerControls.button.transitionDuration} ${theme.motion.playerControls.button.transitionTimingFunction}`,

    "&:hover": {
      color: theme.colors.playerControls.button.foreground,
    },
  });

export const previewThumbnailContainerStyles = (theme: Theme) =>
  css({
    bottom: "100%",
    marginBottom: 8,
    opacity: 0,
    pointerEvents: "none",
    position: "absolute",
    transform: "translateX(-50%)",
    transition: `opacity ${theme.motion.playerControls.progressBar.transitionDuration} ${theme.motion.playerControls.progressBar.transitionTimingFunction}`,

    "[data-is-progress-bar-hovered=true] &": {
      opacity: 1,
    },
  });

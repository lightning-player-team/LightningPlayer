import { css, Theme } from "@emotion/react";

const progressBarTrackHeight = 3;
const progressBarTrackExpandedHeight = 5;
export const progressBarThumbRadius = 6;
export const progressBarThumbExpandedRadius = 8;
const progressBarContainerHeight = progressBarThumbExpandedRadius * 2;

const transitionDuration = "0.1s";
const transitionTimingFunction = "cubic-bezier(0.4, 0, 1, 1)";

export const playerControlOverlayContainerStyles = css({
  background: "transparent",
  height: "100%",
  left: 0,
  opacity: 1,
  position: "absolute",
  top: 0,
  width: "100%",
  // "&[data-is-hovered=true]": {
  //   opacity: 1,
  // },
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
  containerType: "size",
  position: "relative",
  display: "flex",
  cursor: "pointer",
  flexDirection: "column",
  justifyContent: "center",
  width: "100%",
  height: progressBarContainerHeight,
  overflow: "visible",
  backgroundColor: "transparent",
});

export const progressBarCurrentStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.progressBar.thumb,
    height: progressBarTrackHeight,
    position: "absolute",
    transition: `transform ${transitionDuration} ${transitionTimingFunction}`,

    "[data-is-progress-bar-hovered=true] &": {
      transform: `scaleY(${
        progressBarTrackExpandedHeight / progressBarTrackHeight
      })`,
    },
  });

export const progressbarThumbStyles = (theme: Theme) =>
  css({
    position: "absolute",
    borderRadius: "50%",
    height: progressBarThumbRadius * 2,
    width: progressBarThumbRadius * 2,
    backgroundColor: theme.colors.playerControls.progressBar.thumb,
    transition: `scale ${transitionDuration} ${transitionTimingFunction}`,

    "[data-is-progress-bar-hovered=true] &": {
      transform: `scale(${
        progressBarThumbExpandedRadius / progressBarThumbRadius
      })`,
    },
  });

export const progressBarTrackStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.progressBar.background,
    height: progressBarTrackHeight,
    position: "absolute",
    width: "100%",
    transition: `transform ${transitionDuration} ${transitionTimingFunction}`,

    "[data-is-progress-bar-hovered=true] &": {
      transform: `scaleY(${
        progressBarTrackExpandedHeight / progressBarTrackHeight
      })`,
    },
  });

export const progressBarTrackFillStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.progressBar.hoverFill,
    height: progressBarTrackHeight,
    position: "absolute",
  });

export const buttonContainerStyles = css({
  alignItems: "center",
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  marginBottom: 6,
  width: "100%",
});

export const leftContainerStyles = css({
  justifySelf: "start",
});

export const centerContainerStyles = css({
  justifySelf: "center",
});

export const rightContainerStyles = css({
  justifyContent: "end",
});

export const playButtonStyles = (theme: Theme) =>
  css({
    background: "transparent",
    color: theme.colors.playerControls.button.color,
    border: "none",
    lineHeight: 0,
    padding: 0,
    fontSize: 48,
  });

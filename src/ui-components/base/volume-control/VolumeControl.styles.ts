import { css, Theme } from "@emotion/react";

const collapsedWidth = 24;
const iconSliderGap = 4;
const sliderHeight = 4;
export const sliderWidth = 70;
export const thumbSize = 12;
const expandedWidth = collapsedWidth + iconSliderGap + sliderWidth;

const transitionDuration = "0.15s";
const transitionTimingFunction = "ease-in-out";

export const containerStyles = css({
  alignItems: "center",
  display: "flex",
  height: "100%",
  gap: iconSliderGap,
  // overflow: "hidden",
  transition: `width ${transitionDuration} ${transitionTimingFunction}`,
  width: collapsedWidth,

  "&[data-is-volume-control-expanded=true]": {
    width: expandedWidth,
  },
});

export const iconButtonStyles = (theme: Theme) =>
  css({
    background: "transparent",
    border: "none",
    color: theme.colors.playerControls.button.color,
    cursor: "pointer",
    flexShrink: 0,
    fontSize: 24,
    lineHeight: 0,
    padding: 0,
    transitionDuration: theme.motion.playerControls.button.transitionDuration,
    transitionProperty: "color, transform",
    transitionTimingFunction:
      theme.motion.playerControls.button.transitionTimingFunction,

    "&:hover": {
      color: theme.colors.playerControls.button.foreground,
      transform: `scale(${theme.motion.playerControls.button.foregroundScale})`,
    },

    "[data-is-volume-control-expanded=true] &": {
      color: theme.colors.playerControls.button.foreground,
      transform: `scale(${theme.motion.playerControls.button.foregroundScale})`,
    },
  });

export const sliderContainerStyles = css({
  alignItems: "center",
  cursor: "pointer",
  display: "flex",
  height: thumbSize,
  opacity: 0,
  position: "relative",
  transition: `opacity ${transitionDuration} ${transitionTimingFunction}`,
  width: sliderWidth,

  "[data-is-volume-control-expanded=true] &": {
    opacity: 1,
  },
});

export const trackStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.volumeControl.background,
    borderRadius: sliderHeight / 2,
    height: sliderHeight,
    position: "absolute",
    width: "100%",
  });

export const fillStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.volumeControl.fill,
    borderRadius: sliderHeight / 2,
    height: sliderHeight,
    left: 0,
    position: "absolute",
  });

export const thumbStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.volumeControl.thumb,
    borderRadius: "50%",
    height: thumbSize,
    position: "absolute",
    width: thumbSize,
  });

/**
 * Tooltip styles for VolumeControls - displays above the progress bar.
 * Offset: 8px (buttonContainer marginTop) + 16px (progressBar height) + 6px (gap) = 30px.
 * Horizontal positioning is handled dynamically by the Tooltip component via boundsRef.
 */
export const tooltipStyles = (theme: Theme) =>
  css({
    background: theme.colors.playerControls.tooltip.background,
    bottom: "100%",
    color: theme.colors.playerControls.tooltip.color,
    marginBottom: 30,
    marginTop: 0,
    top: "auto",
  });

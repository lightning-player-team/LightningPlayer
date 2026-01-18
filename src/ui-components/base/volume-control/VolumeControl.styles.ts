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
  gap: iconSliderGap,
  overflow: "hidden",
  transition: `width ${transitionDuration} ${transitionTimingFunction}`,
  width: collapsedWidth,

  "&[data-is-expanded=true]": {
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

  "[data-is-expanded=true] &": {
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

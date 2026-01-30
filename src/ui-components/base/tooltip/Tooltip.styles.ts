import { css, Theme } from "@emotion/react";
import { ZIndex } from "../../../shared/styles/zIndex";

export const tooltipContainerStyles = css({
  alignItems: "center",
  display: "flex",
  height: "100%",
  position: "relative",
});

/**
 * Default position: bottom (below trigger), auto-flips to top via data attribute.
 */
export const tooltipContentStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.tooltip.background,
    borderRadius: 8,
    color: theme.colors.tooltip.color,
    fontSize: 12,
    left: "50%",
    marginTop: 6,
    opacity: 0,
    padding: "6px 10px",
    pointerEvents: "none",
    position: "absolute",
    top: "100%",
    transform: "translateX(-50%)",
    transition: "opacity 0.15s ease-in-out",
    whiteSpace: "nowrap",
    zIndex: ZIndex.TOOLTIP,

    // Show on hover.
    "[data-is-hovered=true] > &": {
      opacity: 1,
    },

    "&[data-show-tooltip=true]": {
      opacity: 1,
    },

    // Auto-flip to top when data-position="top".
    "&[data-tooltip--position=top]": {
      bottom: "100%",
      marginBottom: 6,
      marginTop: 0,
      top: "auto",
    },
  });

import { css, Theme } from "@emotion/react";

export const textButtonStyles = (theme: Theme) =>
  css({
    background: theme.colors.button.text.background,
    border: "none",
    borderRadius: 4,
    color: theme.colors.button.text.color,
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 500,
    letterSpacing: "0.02857em",
    lineHeight: 1.75,
    padding: "6px 8px",
    "&:hover": {
      background: theme.colors.button.text.hoverBackground,
    },
  });

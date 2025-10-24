import { css } from "@emotion/react";

export const dragAndDropOverlayStyles = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.9)",
});

export const contentContainerStyles = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  rowGap: "0.75em",
});

export const buttonsContainerStyles = css({
  columnGap: "8px",
  display: "flex",
  flexDirection: "row",
});

export const fileNotSupportedOverlayStyles = css({
  cursor: "not-allowed",
});

export const buttonStyles = css({
  fontSize: "1.5rem",
  padding: "6px 16px",
});

export const orTextStyles = css({
  margin: 0,
});

export const dragAndDropTextStyles = css({
  marginTop: "6px",
  marginBottom: "6px",
});

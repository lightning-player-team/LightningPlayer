import { css, Theme } from "@emotion/react";

export const thumbnailHeight = 90;
export const thumbnailWidth = 160;
const borderRadius = 4;

export const containerStyles = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const thumbnailStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.previewThumbnail.background,
    border: `1px solid ${theme.colors.playerControls.previewThumbnail.border}`,
    borderRadius,
    height: thumbnailHeight,
    objectFit: "cover",
    width: thumbnailWidth,
  });

export const placeholderStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playerControls.previewThumbnail.background,
    border: `1px solid ${theme.colors.playerControls.previewThumbnail.border}`,
    borderRadius,
    height: thumbnailHeight,
    width: thumbnailWidth,
  });

export const timestampStyles = (theme: Theme) =>
  css({
    backgroundColor:
      theme.colors.playerControls.previewThumbnail.timestampBackground,
    borderRadius: 2,
    color: theme.colors.playerControls.previewThumbnail.timestampColor,
    fontSize: 12,
    fontWeight: 500,
    padding: "2px 6px",
  });

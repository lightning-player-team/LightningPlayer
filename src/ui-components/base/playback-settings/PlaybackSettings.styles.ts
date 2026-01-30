import { css, Theme } from "@emotion/react";

export const playbackSettingsContainerStyles = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.playbackSettings.background,
    borderRadius: 12,
    bottom: "100%",
    marginBottom: 8,
    minHeight: 200,
    minWidth: 250,
    padding: 8,
    position: "absolute",
    right: 0,
  });

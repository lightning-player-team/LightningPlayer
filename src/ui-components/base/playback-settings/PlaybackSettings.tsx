import { FC, useEffect, useRef } from "react";
import { playbackSettingsContainerStyles } from "./PlaybackSettings.styles";

export interface IPlaybackSettingsProps {
  onClose: () => void;
}

/**
 * TODO:
 *
 * 1. Fix settings button.
 * 2. Implement PlaybackSettings with two settings: 1. Pin controls 2. Rotate.
 */

/**
 * A popup settings menu that appears above the progress bar, on top of the settings button.
 *
 * @param props - The component props.
 * @param props.onClose - Callback invoked when clicking outside the settings menu.
 * @returns The playback settings component.
 */
export const PlaybackSettings: FC<IPlaybackSettingsProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div css={playbackSettingsContainerStyles} ref={containerRef}>
      {/* Empty for now - placeholder for settings content. */}
    </div>
  );
};

import { FC, useEffect, useRef } from "react";
import { playbackSettingsContainerStyles } from "./PlaybackSettings.styles";

export interface IPlaybackSettingsProps {
  onClose: () => void;
}

/**
 * A YouTube-style popup settings menu that appears near the settings button.
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

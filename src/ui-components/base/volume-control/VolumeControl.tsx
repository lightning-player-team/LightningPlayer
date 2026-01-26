import {
  Dispatch,
  FC,
  MouseEventHandler,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { SpeakerIcon } from "../../../assets/svgs/SpeakerIcon";
import { SpeakerMuteIcon } from "../../../assets/svgs/SpeakerMuteIcon";
import { getVolumeFromEvent } from "./getVolumeFromEvent";
import {
  containerStyles,
  fillStyles,
  iconButtonStyles,
  sliderContainerStyles,
  sliderWidth,
  thumbSize,
  thumbStyles,
  trackStyles,
} from "./VolumeControl.styles";

export interface IVolumeControlProps {
  isMuted: boolean;
  /**
   * The VolumeControl is pinned when the user makes an update to the volume.
   * It stays pinned until the user interacts with another player control element.
   */
  isPinned: boolean;
  onMuteToggle: () => void;
  /**
   * @param volume goes from 0 to 1.
   */
  onVolumeChange: (volume: number) => void;
  setIsPinned: Dispatch<SetStateAction<boolean>>;
  volume: number;
}

export const VolumeControl: FC<IVolumeControlProps> = ({
  isMuted,
  isPinned,
  onMuteToggle,
  onVolumeChange,
  setIsPinned,
  volume,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const isExpanded = isHovered || isPinned;
  const thumbPosition = (isMuted ? 0 : volume) * (sliderWidth - thumbSize);
  const VolumeIcon = isMuted ? SpeakerMuteIcon : SpeakerIcon;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSliderMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button !== 0) return;
    // Prevents text selection.
    event.preventDefault();
    setIsPinned(true);
    const newVolume = getVolumeFromEvent({ event, sliderRef });
    if (newVolume !== undefined) {
      console.log("VolumeControl: setting volume:", newVolume);
      onVolumeChange(newVolume);
    }

    // Drag handlers.
    const handleMouseMove = (e: MouseEvent) => {
      const newVolume = getVolumeFromEvent({ event: e, sliderRef });
      if (newVolume !== undefined) {
        console.log("VolumeControl: setting volume:", newVolume);
        onVolumeChange(newVolume);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      css={containerStyles}
      data-is-expanded={isExpanded}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        aria-label={isMuted ? "Unmute" : "Mute"}
        css={iconButtonStyles}
        onClick={onMuteToggle}
        type="button"
      >
        <VolumeIcon />
      </button>
      <div
        css={sliderContainerStyles}
        onMouseDown={handleSliderMouseDown}
        ref={sliderRef}
      >
        <div css={trackStyles} />
        <div css={fillStyles} style={{ width: thumbPosition }} />
        <div css={thumbStyles} style={{ left: thumbPosition }} />
      </div>
    </div>
  );
};

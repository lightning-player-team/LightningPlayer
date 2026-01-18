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

interface VolumeControlProps {
  isMuted: boolean;
  isPinned: boolean;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number) => void;
  setIsPinned: Dispatch<SetStateAction<boolean>>;
  volume: number;
}

export const VolumeControl: FC<VolumeControlProps> = ({
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
  const thumbPosition =
    ((isMuted ? 0 : volume) / 100) * (sliderWidth - thumbSize);
  const VolumeIcon = isMuted ? SpeakerMuteIcon : SpeakerIcon;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSliderMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    setIsPinned(true);
    const newVolume = getVolumeFromEvent({ event, sliderRef });
    if (newVolume !== undefined) {
      onVolumeChange(newVolume);
    }

    // Drag handlers.
    const handleMouseMove = (e: MouseEvent) => {
      const newVolume = getVolumeFromEvent({ event: e, sliderRef });
      if (newVolume !== undefined) {
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

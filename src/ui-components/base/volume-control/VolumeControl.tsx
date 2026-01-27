import {
  Dispatch,
  FC,
  MouseEventHandler,
  SetStateAction,
  useRef,
  useState,
} from "react";
import Speaker0Icon from "../../../assets/svgs/speaker-0.svg?react";
import Speaker1Icon from "../../../assets/svgs/speaker-1.svg?react";
import Speaker2Icon from "../../../assets/svgs/speaker-2.svg?react";
import SpeakerMuteIcon from "../../../assets/svgs/speaker-mute.svg?react";
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

  /**
   * Renders the appropriate speaker icon based on mute state and volume level.
   */
  const renderVolumeIcon = () => {
    if (isMuted) return <SpeakerMuteIcon />;
    if (volume === 0) return <Speaker0Icon />;
    if (volume <= 0.5) return <Speaker1Icon />;
    return <Speaker2Icon />;
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
        {renderVolumeIcon()}
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

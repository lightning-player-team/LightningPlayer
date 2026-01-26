import {
  Dispatch,
  FC,
  MouseEventHandler,
  SetStateAction,
  useRef,
  useState,
} from "react";
import PauseIcon from "../../../assets/svgs/PauseIcon";
import PlayIcon from "../../../assets/svgs/PlayIcon";
import { useDimensions } from "../../../shared/hooks/useDimensions";
import { PreviewThumbnail } from "../../base/preview-thumbnail/PreviewThumbnail";
import { thumbnailWidth } from "../../base/preview-thumbnail/PreviewThumbnail.styles";
import { VolumeControl } from "../../base/volume-control/VolumeControl";
import { getProgressFromEvent } from "./getProgressFromEvent";
import { getProgressPercentageFromEvent } from "./getProgressPercentageFromEvent";
import {
  bottomControlsContainerStyles,
  buttonContainerStyles,
  centerContainerStyles,
  leftContainerStyles,
  playButtonStyles,
  playerControlOverlayContainerStyles,
  previewThumbnailContainerStyles,
  progressBarContainerStyles,
  progressBarCurrentStyles,
  progressbarThumbStyles,
  progressBarTrackFillStyles,
  progressBarTrackStyles,
  rightContainerStyles,
} from "./PlayerControlOverlay.styles";

export interface IPlayerControlOverlayProps {
  /**
   * Duration in seconds.
   */
  duration: number;
  /**
   * @param timestamp in seconds. This component simply passes it to PreviewThumbnail.
   */
  getThumbnail: (timestamp: number) => Promise<string | undefined>;
  isMuted: boolean;
  isPlaying: boolean;
  onMuteToggle: () => void;
  /**
   * @param volume from 0 to 100. This component simply passes it to VolumeControl.
   */
  onVolumeChange: (volume: number) => void;
  pause: () => void;
  /**
   * Time in seconds.
   */
  play: (time: number) => Promise<void>;
  /**
   * Progress in seconds.
   */
  progress: number;
  /**
   * Time in seconds.
   */
  seek(time: number): Promise<void>;
  /**
   * Set progress in seconds.
   */
  setProgress: Dispatch<SetStateAction<number>>;
  volume: number;
}

export const PlayerControlOverlay: FC<IPlayerControlOverlayProps> = ({
  duration,
  getThumbnail,
  isMuted,
  isPlaying,
  onMuteToggle,
  onVolumeChange,
  pause,
  play,
  progress,
  seek,
  setProgress,
  volume,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  // HoverPercentage from 0 to 1. Undefined means not hovering.
  const [hoverPercentage, setHoverPercentage] = useState<number | undefined>(
    undefined,
  );
  const [isProgressBarHovered, setIsProgressBarHovered] = useState(false);
  // The VolumeControl is pinned when the user makes an update to the volume.
  // It stays pinned until the user interacts with another player control element.
  const [isVolumePinned, setIsVolumePinned] = useState(false);
  const progressBarContainerRef = useRef<HTMLDivElement>(null);
  const progressBarContainerDimensions = useDimensions(progressBarContainerRef);
  // Percentage from 0 to 1.
  const progressPercentage = progress / duration;

  const handleOnClickPlayButton = () => {
    setIsVolumePinned(false);
    if (!isPlaying) {
      play(progress);
    } else {
      pause();
    }
  };

  const handleOnMouseEnterOverlay = () => {
    // console.log("hovered");
    setIsHovered(true);
  };

  const handleOnMouseLeaveOverlay = () => {
    setIsHovered(false);
  };

  const handleOnMouseEnterProgressBar = () => {
    setIsProgressBarHovered(true);
  };

  const handleOnMouseLeaveProgressBar = () => {
    setIsProgressBarHovered(false);
    // Keep hoverPercentage value so thumbnail stays in place during fade-out.
  };

  const handleOnMouseDownProgressBar: MouseEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    setIsVolumePinned(false);

    const newProgress = getProgressFromEvent({
      duration,
      event,
      progressBarContainerRef,
    });
    console.log(
      `Seeking started at: percentage ${progressPercentage}, progress ${newProgress}`,
    );
    setProgress(newProgress);

    if (isPlaying) {
      pause();
    }

    // Drag handlers.
    const handleMouseMove = (e: MouseEvent) => {
      const newProgress = getProgressFromEvent({
        duration,
        event: e,
        progressBarContainerRef,
      });
      console.log(
        `Seeking moving at: percentage ${progressPercentage}, progress ${newProgress}`,
      );
      setProgress(newProgress);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const newProgress = getProgressFromEvent({
        duration,
        event: e,
        progressBarContainerRef,
      });
      console.log("Seeking ended.");

      if (isPlaying) {
        play(newProgress);
      } else {
        seek(newProgress);
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleOnMouseMoveProgressBar: MouseEventHandler<HTMLDivElement> = (
    event,
  ) => {
    const percentage = getProgressPercentageFromEvent({
      event,
      progressBarContainerRef,
    });
    setHoverPercentage(percentage);
  };

  // Calculate previewThumbnailLeft. When progressBarContainerDimensions is
  // not ready, fall back to minLeft which is the position at 0 second.
  const containerWidth = progressBarContainerDimensions?.width ?? 0;
  const rawPosition = (hoverPercentage ?? 0) * containerWidth;
  const minLeft = thumbnailWidth / 2;
  const maxLeft = containerWidth - thumbnailWidth / 2;
  const previewThumbnailLeft = Math.max(
    minLeft,
    Math.min(maxLeft, rawPosition),
  );

  return (
    <div
      css={playerControlOverlayContainerStyles}
      data-is-hovered={isHovered}
      onMouseEnter={handleOnMouseEnterOverlay}
      onMouseLeave={handleOnMouseLeaveOverlay}
    >
      <div css={bottomControlsContainerStyles}>
        {/* ProgressBar container */}
        <div
          css={progressBarContainerStyles}
          data-is-progress-bar-hovered={isProgressBarHovered}
          onMouseDown={handleOnMouseDownProgressBar}
          onMouseEnter={handleOnMouseEnterProgressBar}
          onMouseMove={handleOnMouseMoveProgressBar}
          onMouseLeave={handleOnMouseLeaveProgressBar}
          ref={progressBarContainerRef}
        >
          {/* Preview thumbnail */}
          <div
            css={[
              previewThumbnailContainerStyles,
              { left: previewThumbnailLeft },
            ]}
          >
            <PreviewThumbnail
              getThumbnail={getThumbnail}
              timestamp={Math.floor((hoverPercentage ?? 0) * duration)}
            />
          </div>
          {/* Main progress bar */}
          <div css={progressBarTrackStyles}>
            <div
              css={[
                progressBarTrackFillStyles,
                {
                  width: `${(hoverPercentage ?? 0) * 100}%`,
                },
              ]}
            />
          </div>
          <div
            css={[
              progressBarCurrentStyles,
              {
                width: `${progressPercentage * 100}%`,
              },
            ]}
          ></div>
          <div
            css={[
              progressbarThumbStyles,
              {
                translate: `${progressPercentage * 100}cqw`,
              },
            ]}
          />
        </div>
        {/* Button controls */}
        <div css={buttonContainerStyles}>
          <div css={leftContainerStyles}>
            <VolumeControl
              isMuted={isMuted}
              isPinned={isVolumePinned}
              onMuteToggle={onMuteToggle}
              onVolumeChange={onVolumeChange}
              setIsPinned={setIsVolumePinned}
              volume={volume}
            />
          </div>
          <div css={centerContainerStyles}>
            <button
              aria-label="Play"
              css={playButtonStyles}
              onClick={handleOnClickPlayButton}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
          <div css={rightContainerStyles} />
        </div>
      </div>
    </div>
  );
};

import {
  Dispatch,
  FC,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import PauseIcon from "../../../assets/svgs/PauseIcon";
import PlayIcon from "../../../assets/svgs/PlayIcon";
import { formatTimestamp } from "../../../shared/utils/formatTimestamp";
import { PreviewThumbnail } from "../../base/preview-thumbnail/PreviewThumbnail";
import { VolumeControl } from "../../base/volume-control/VolumeControl";
import { getProgressPercentageFromEvent } from "./getProgressPercentageFromEvent";
import {
  bottomControlsContainerStyles,
  buttonContainerStyles,
  centerContainerStyles,
  leftContainerStyles,
  playButtonStyles,
  playerControlOverlayContainerStyles,
  previewThumbnailWrapperStyles,
  progressBarContainerStyles,
  progressBarCurrentStyles,
  progressbarThumbStyles,
  progressBarTrackFillStyles,
  progressBarTrackStyles,
  rightContainerStyles,
} from "./PlayerControlOverlay.styles";

export interface PlayerControlOverlayProps {
  /**
   * Duration in seconds.
   */
  duration: number;
  /**
   * Fetch a thumbnail for the given timestamp.
   */
  getThumbnail: (timestamp: number) => Promise<string | undefined>;
  isMuted: boolean;
  isPlaying: boolean;
  onMuteToggle: () => void;
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

export const PlayerControlOverlay: FC<PlayerControlOverlayProps> = ({
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
  const [containerWidth, setContainerWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  // HoverPercentage from 0 to 1. Undefined means not hovering.
  const [hoverPercentage, setHoverPercentage] = useState<number | undefined>(
    undefined,
  );
  const [isProgressBarHovered, setIsProgressBarHovered] = useState(false);
  const [isVolumePinned, setIsVolumePinned] = useState(false);
  const progressBarContainerRef = useRef<HTMLDivElement>(null);
  // Percentage from 0 to 1.
  const percentage = progress / duration;

  // Track container width for clamping thumbnail position.
  useEffect(() => {
    const container = progressBarContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate thumbnail position.
  const thumbnailWidth = 160;
  const halfThumbnailWidth = thumbnailWidth / 2;
  const currentHoverPercentage = hoverPercentage ?? 0;
  const hoverTime = currentHoverPercentage * duration;
  const hoverTimestamp = Math.floor(hoverTime);
  const rawPosition = currentHoverPercentage * containerWidth;
  const clampedPosition = Math.max(
    halfThumbnailWidth,
    Math.min(containerWidth - halfThumbnailWidth, rawPosition),
  );

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

    const percentage = getProgressPercentageFromEvent({
      event,
      progressBarContainerRef,
    });
    const newProgress = duration * percentage;
    console.log(
      `Seeking started at: percentage ${percentage}, progress ${newProgress}`,
    );
    setProgress(newProgress);

    if (isPlaying) {
      pause();
    }

    // Drag handlers.
    const handleMouseMove = (e: MouseEvent) => {
      const percentage = getProgressPercentageFromEvent({
        event: e,
        progressBarContainerRef,
      });
      const newProgress = duration * percentage;
      console.log(
        `Seeking moving at: percentage ${percentage}, progress ${newProgress}`,
      );
      setProgress(newProgress);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const percentage = getProgressPercentageFromEvent({
        event: e,
        progressBarContainerRef,
      });
      const newProgress = duration * percentage;
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
          <div css={[previewThumbnailWrapperStyles, { left: clampedPosition }]}>
            <PreviewThumbnail
              formattedTimestamp={formatTimestamp(hoverTime)}
              getThumbnail={getThumbnail}
              timestamp={hoverTimestamp}
            />
          </div>
          <div css={progressBarTrackStyles}>
            <div
              css={[
                progressBarTrackFillStyles,
                {
                  width: `${(hoverPercentage || 0) * 100}%`,
                },
              ]}
            />
          </div>
          <div
            css={[
              progressBarCurrentStyles,
              {
                width: `${percentage * 100}%`,
              },
            ]}
          ></div>
          <div
            css={[
              progressbarThumbStyles,
              {
                translate: `${percentage * 100}cqw`,
              },
            ]}
          />
        </div>
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

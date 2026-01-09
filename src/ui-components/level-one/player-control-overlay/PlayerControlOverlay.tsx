import {
  Dispatch,
  FC,
  MouseEventHandler,
  RefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";
import PauseIcon from "../../../assets/svgs/PauseIcon";
import PlayIcon from "../../../assets/svgs/PlayIcon";
import {
  bottomControlsContainerStyles,
  buttonContainerStyles,
  centerContainerStyles,
  leftContainerStyles,
  playButtonStyles,
  playerControlOverlayContainerStyles,
  progressBarContainerStyles,
  progressBarCurrentStyles,
  progressbarThumbStyles,
  progressBarTrackFillStyles,
  progressBarTrackStyles,
  rightContainerStyles,
} from "./PlayerControlOverlay.styles";
import { getProgressPercentageFromEvent } from "./getProgressPercentageFromEvent";

export interface PlayerControlOverlayProps {
  /**
   * Duration in seconds.
   */
  duration: number;
  isPlaying: boolean;
  pause: () => void;
  /**
   * Time in seconds.
   */
  play: (time: number) => Promise<void>;
  /**
   * Progress in seconds.
   */
  progress: number;
  progressRef: RefObject<number>;
  /**
   * Needs to be used in sync with isPlayingRef.
   */
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  /**
   * Time in seconds.
   */
  seek(time: number): Promise<void>;
  /**
   * Set progress in seconds.
   */
  setProgress: Dispatch<SetStateAction<number>>;
}

export const PlayerControlOverlay: FC<PlayerControlOverlayProps> = ({
  duration,
  isPlaying,
  pause,
  play,
  progress,
  progressRef,
  setIsPlaying,
  seek,
  setProgress,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Only set when the user clicks on the progress bar while the video is playing.
  // The video is first paused, and resumes when the user lifts the click.
  const [resumePlaying, setResumePlaying] = useState(false);
  const [isProgressBarHovered, setIsProgressBarHovered] = useState(false);
  // HoverPercentage from 0 to 1. Undefined means not seeking.
  const [hoverPercentage, setHoverPercentage] = useState<number | undefined>(
    undefined
  );
  const [isSeeking, setIsSeeking] = useState(false);
  const progressBarContainerRef = useRef<HTMLDivElement>(null);
  // Percentage from 0 to 1.
  const percentage = progress / duration;

  const handleOnClickPlayButton = () => {
    if (!isPlaying) {
      setIsPlaying(true);

      play(progress);
    } else {
      setIsPlaying(false);

      pause();
    }
  };

  const handleOnMouseEnterOverlay = () => {
    // console.log("hovered");
    setIsHovered(true);
  };
  const handleOnMouseLeaveOverlay = () => {
    setIsHovered(false);
    if (isSeeking) {
      console.log("Seeking ended.");
      setIsSeeking(false);
    }
  };

  const handleOnMouseEnterProgressBar = () => {
    setIsProgressBarHovered(true);
  };
  const handleOnMouseLeaveProgressBar = () => {
    setIsProgressBarHovered(false);
    setHoverPercentage(undefined);
  };

  // Track mouseDown sets isSeeking to true and starts moving the progress bar.
  // The user can move outside of the track as well, so the corresponding
  // move and up handlers are the overlay's.
  const handleOnMouseDownProgressBar: MouseEventHandler<HTMLDivElement> = (
    event
  ) => {
    // Prevent drag and drop.
    if (event.button === 0) {
      event.preventDefault();
      setIsSeeking(true);
      const percentage = getProgressPercentageFromEvent(
        event,
        progressBarContainerRef
      );

      const newProgress = duration * percentage;
      console.log(
        `Seeking started at: percentage ${percentage}, progress ${newProgress}`
      );

      setProgress(newProgress);
      progressRef.current = newProgress;
      if (isPlaying) {
        pause();

        setResumePlaying(true);
      }
    }
  };

  const handleOnMouseMoveProgressBar: MouseEventHandler<HTMLDivElement> = (
    event
  ) => {
    const percentage = getProgressPercentageFromEvent(
      event,
      progressBarContainerRef
    );
    setHoverPercentage(percentage);
  };

  const handleOnMouseMoveOverlay: MouseEventHandler<HTMLDivElement> = (
    event
  ) => {
    const percentage = getProgressPercentageFromEvent(
      event,
      progressBarContainerRef
    );
    const newProgress = duration * percentage;
    if (isSeeking) {
      console.log(
        `Seeking moving at: percentage ${percentage}, progress ${newProgress}`
      );
      setProgress(newProgress);
    }
  };

  const handleOnMouseUpOverlay: MouseEventHandler<HTMLDivElement> = (event) => {
    if (isSeeking) {
      setIsSeeking(false);
      const percentage = getProgressPercentageFromEvent(
        event,
        progressBarContainerRef
      );
      const newProgress = duration * percentage;
      console.log("Seeking ended.");

      if (resumePlaying) {
        play(newProgress);
        setResumePlaying(false);
      } else {
        seek(newProgress);
      }
    }
  };

  return (
    <div
      css={playerControlOverlayContainerStyles}
      data-is-hovered={isHovered}
      onMouseEnter={handleOnMouseEnterOverlay}
      onMouseLeave={handleOnMouseLeaveOverlay}
      onMouseMove={handleOnMouseMoveOverlay}
      onMouseUp={handleOnMouseUpOverlay}
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
          <div css={leftContainerStyles}>something left</div>
          <div css={centerContainerStyles}>
            <button
              aria-label="Play"
              css={playButtonStyles}
              onClick={handleOnClickPlayButton}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
          <div css={rightContainerStyles}>something right</div>
        </div>
      </div>
    </div>
  );
};

import {
  Dispatch,
  FC,
  MouseEventHandler,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { InfoIcon } from "../../../assets/svgs/InfoIcon";
import { ResizableWindow } from "../../base/resizable-window/ResizableWindow";
import {
  bottomControlsContainerStyles,
  infoButtonStyles,
  infoWindowStyles,
  playerControlOverlayContainerStyles,
  progressBarContainerStyles,
  progressBarCurrentStyles,
  progressBarHoverAreaStyles,
  progressbarThumbStyles,
  progressBarTrackFillStyles,
  progressBarTrackStyles,
} from "./PlayerControlOverlay.styles";
import { getProgressPercentageFromEvent } from "./getProgressPercentageFromEvent";

export interface PlayerControlOverlayProps {
  /* Duration in seconds. */
  duration: number;
  /* Time in seconds. */
  seek(time: number): Promise<void>;
  /* Set progress in seconds. */
  setProgress: Dispatch<SetStateAction<number>>;
  /* Progress in seconds. */
  progress: number;
}

export const PlayerControlOverlay: FC<PlayerControlOverlayProps> = ({
  duration,
  seek,
  setProgress,
  progress,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoInfoWindowOpen, setIsVideoInfoWindowOpen] = useState(false);
  const [isProgressBarHovered, setIsProgressBarHovered] = useState(false);
  // HoverPercentage from 0 to 1. Undefined means not seeking.
  const [hoverPercentage, setHoverPercentage] = useState<number | undefined>(
    undefined
  );
  const [isSeeking, setIsSeeking] = useState(false);
  const progressBarContainerRef = useRef<HTMLDivElement>(null);
  // Percentage from 0 to 1.
  const percentage = progress / duration;

  const handleOnClickInfoButton = () => {
    setIsVideoInfoWindowOpen(!isVideoInfoWindowOpen);
  };

  const handleOnClickInfoWindowClose = () => {
    setIsVideoInfoWindowOpen(false);
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

  const handleOnMouseDownTrack: MouseEventHandler<HTMLDivElement> = (event) => {
    // Prevent drag and drop.
    event.preventDefault();
    setIsSeeking(true);
    const percentage = getProgressPercentageFromEvent(
      event,
      progressBarContainerRef
    );
    console.log(
      `Seeking started at: percentage ${percentage}, progress ${
        percentage * duration
      }`
    );
    seek(duration * percentage);
    setProgress(duration * percentage);
  };
  const handleOnMouseMoveTrack: MouseEventHandler<HTMLDivElement> = (event) => {
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
    if (isSeeking) {
      console.log(
        `Seeking ended at: percentage ${percentage}, progress ${
          percentage * duration
        }`
      );
      setProgress(percentage * duration);
    }
  };

  const handleOnMouseUpOverlay: MouseEventHandler<HTMLDivElement> = (event) => {
    if (isSeeking) {
      const percentage = getProgressPercentageFromEvent(
        event,
        progressBarContainerRef
      );
      console.log("Seeking ended.");
      seek(duration * percentage);
      setIsSeeking(false);
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
        <div
          css={progressBarContainerStyles}
          data-is-progress-bar-hovered={isProgressBarHovered}
          draggable
          onMouseEnter={handleOnMouseEnterProgressBar}
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
          <div
            css={progressBarHoverAreaStyles}
            onMouseMove={handleOnMouseMoveTrack}
            onMouseDown={handleOnMouseDownTrack}
          />
        </div>
        <button
          aria-label="Video Info"
          css={infoButtonStyles}
          onClick={handleOnClickInfoButton}
        >
          <InfoIcon />
        </button>
      </div>
      {isVideoInfoWindowOpen && (
        <ResizableWindow
          css={infoWindowStyles}
          onClose={handleOnClickInfoWindowClose}
          title={"Media Info"}
        ></ResizableWindow>
      )}
    </div>
  );
};

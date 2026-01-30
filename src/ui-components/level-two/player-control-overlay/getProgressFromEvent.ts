import { getProgressPercentageFromEvent } from "./getProgressPercentageFromEvent";

/**
 * @returns progress (in seconds) from mouse position relative to progress bar.
 * @returns 0 if progressBarContainer is not available.
 */
export const getProgressFromEvent = ({
  duration,
  event,
  progressBarContainerRef,
}: {
  duration: number;
  event: MouseEvent | React.MouseEvent;
  progressBarContainerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const progressPercentage = getProgressPercentageFromEvent({
    event,
    progressBarContainerRef,
  });
  return duration * progressPercentage;
};

/**
 * Calculates progress percentage (0-1) from mouse position relative to progress bar.
 * Returns 0 if the progress bar ref is not available.
 */
export const getProgressPercentageFromEvent = ({
  event,
  progressBarContainerRef,
}: {
  event: MouseEvent | React.MouseEvent;
  progressBarContainerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const progressBarContainer = progressBarContainerRef.current;
  if (!progressBarContainer) {
    return 0;
  }
  const rect = progressBarContainer.getBoundingClientRect();
  const percentage = (event.clientX - rect.left) / rect.width;
  return Math.max(0, Math.min(1, percentage));
};
